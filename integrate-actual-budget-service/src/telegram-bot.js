const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const config = require('./config');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BUDGET_SERVICE_URL = process.env.BUDGET_SERVICE_URL || 'http://budget-service:3001';

let bot = null;

const startBot = () => {
  if (!BOT_TOKEN) {
    console.log('[TELEGRAM BOT] TOKEN tidak tersedia, skip inisialisasi');
    return;
  }

  bot = new TelegramBot(BOT_TOKEN, { polling: true });

  console.log('[TELEGRAM BOT] Bot starting (polling)...');

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Halo! Saya budget bot. Kirim transaksi dengan format:\n- `B Makan nasi 15k` (expense)\n- `J Gaji 500k` (income)\n- `beli makan 50k` (auto-detect)');
  });

  bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Cara menggunakan:\n1. Kirim pesan dengan format transaksi\n2. Contoh: `B Makan nasi 15k` atau `beli makan 50k`\n3. Bot akan otomatis parse dan simpan ke budget');
  });

  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      const response = await axios.get(`${BUDGET_SERVICE_URL}/api/budget/status`);
      bot.sendMessage(chatId, `Status sync: ${response.data.status || 'unknown'}`);
    } catch (error) {
      bot.sendMessage(chatId, `Error: ${error.message}`);
    }
  });

  bot.onText(/^(B|J)\s+(.+)\s+(.+)$/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const [_, type, payee, amountStr] = match;
    
    try {
      const amount = parseAmount(amountStr);
      const transactionType = type.toUpperCase() === 'B' ? 'expense' : 'income';
      const date = new Date().toISOString().split('T')[0];
      
      await saveTransaction({
        date,
        amount: type.toUpperCase() === 'B' ? -Math.abs(amount) : amount,
        payee,
        category: 'Makanan & Minuman',
        notes: msg.text
      });
      
      bot.sendMessage(chatId, `✅ Record added: ${type} ${payee} ${amountStr}`);
    } catch (error) {
      bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  });

  bot.onText(/(.+)/, async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text.toLowerCase();
    
    try {
      if (text.includes('beli') || text.includes('bayar')) {
        const amount = parseAmount(text);
        if (amount) {
          await saveTransaction({
            date: new Date().toISOString().split('T')[0],
            amount: -Math.abs(amount),
            payee: msg.text,
            category: 'Makanan & Minuman',
            notes: 'Auto-detect expense'
          });
          bot.sendMessage(chatId, `✅ Transaksi expense: ${msg.text}`);
          return;
        }
      }
      
      if (text.includes('gaji') || text.includes('income') || text.includes('pendapatan')) {
        const amount = parseAmount(text);
        if (amount) {
          await saveTransaction({
            date: new Date().toISOString().split('T')[0],
            amount: amount,
            payee: msg.text,
            category: 'Gaji',
            notes: 'Auto-detect income'
          });
          bot.sendMessage(chatId, `✅ Transaksi income: ${msg.text}`);
          return;
        }
      }
      
      bot.sendMessage(chatId, 'Format tidak dikenali. Gunakan `B `untuk expense atau `J `untuk income.');
    } catch (error) {
      bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  });
};

const parseAmount = (str) => {
  const match = str.match(/(\d+)(k|jt)?/i);
  if (!match) return null;
  
  let num = parseInt(match[1]);
  if (match[2]) {
    if (match[2].toLowerCase() === 'k') num *= 1000;
    if (match[2].toLowerCase() === 'jt') num *= 1000000;
  }
  return num;
};

const saveTransaction = async (data) => {
  const accountId = process.env.ACCOUNT_ID || 'budget_7133351898';
  const response = await axios.post(`${BUDGET_SERVICE_URL}/api/budget/transactions`, {
    accountId,
    transactions: [{
      date: data.date,
      amount: data.amount,
      payee: data.payee,
      category: data.category,
      notes: data.notes
    }]
  });
  return response.data;
};

module.exports = { startBot };

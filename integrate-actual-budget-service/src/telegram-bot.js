const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BUDGET_SERVICE_URL = process.env.BUDGET_SERVICE_URL || 'http://budget-service:3001';
const DEFAULT_CATEGORY = process.env.DEFAULT_CATEGORY || 'Makanan & Minuman';

let bot = null;

const startBot = () => {
  if (!BOT_TOKEN) {
    console.log('[TELEGRAM BOT] TOKEN tidak tersedia, skip inisialisasi');
    return;
  }

  bot = new TelegramBot(BOT_TOKEN, { polling: true });
  console.log('[TELEGRAM BOT] Bot starting (polling)...');

  bot.on('message', async (msg) => {
    if (!msg.text || msg.text.startsWith('/')) return handleCommand(msg);
    return handleTransaction(msg);
  });
};

// ===== COMMANDS =====
const handleCommand = async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    return bot.sendMessage(chatId, 
      '🤖 *Budget Bot*\n\n' +
      'Kirim transaksi:\n' +
      '• `B Makan nasi 15k` — expense\n' +
      '• `J Gaji 500k` — income\n' +
      '• `beli makan 50k` — auto-detect\n\n' +
      'Commands: /status /export /help',
      { parse_mode: 'Markdown' }
    );
  }

  if (text === '/help') {
    return bot.sendMessage(chatId, 
      '*Cara Pakai:*\n' +
      '`B <deskripsi> <jumlah>` — Beli/expense\n' +
      '`J <deskripsi> <jumlah>` — Jual/income\n' +
      'Contoh: `B Makan Nasi Goreng 15k`\n\n' +
      '*Natural language:*\n' +
      '`beli`, `bayar`, `gaji`, `terima`',
      { parse_mode: 'Markdown' }
    );
  }

  if (text === '/status') {
    try {
      const response = await axios.get(`${BUDGET_SERVICE_URL}/api/budget/status`);
      return bot.sendMessage(chatId, `📊 Status: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      return bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }

  if (text === '/export') {
    try {
      const response = await axios.get(`${BUDGET_SERVICE_URL}/api/budget/export`);
      return bot.sendMessage(chatId, `📁 Export: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error) {
      return bot.sendMessage(chatId, `❌ Error: ${error.message}`);
    }
  }
};

// ===== TRANSACTION PARSER =====
const handleTransaction = async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();
  const lowerText = text.toLowerCase();

  try {
    // === FORMAT EKSPLISIT: B/J <deskripsi> <jumlah> ===
    const explicitMatch = text.match(/^(B|J)\s+(.+?)\s+(\d+[,.]?\d*\s*(k|jt|rb|ribu|juta)?)$/i);
    if (explicitMatch) {
      const [, type, payee, amountStr] = explicitMatch;
      const amount = parseAmount(amountStr);
      if (!amount) throw new Error('Jumlah tidak valid');

      const isExpense = type.toUpperCase() === 'B';
      const finalAmount = isExpense ? -Math.abs(amount) : amount;
      const category = isExpense ? DEFAULT_CATEGORY : 'Gaji';

      const result = await saveTransaction({
        date: new Date().toISOString().split('T')[0],
        amount: finalAmount,
        payee: payee.trim(),
        category,
        notes: text
      });

      const emoji = isExpense ? '💸' : '💰';
      return bot.sendMessage(chatId,
        `${emoji} *${isExpense ? 'EXPENSE' : 'INCOME'}*\n` +
        `Payee: ${payee}\n` +
        `Amount: ${formatRupiah(amount)}\n` +
        `Category: ${category}\n` +
        `Status: ✅ Saved (ID: ${result?.id || 'N/A'})`,
        { parse_mode: 'Markdown' }
      );
    }

    // === NATURAL LANGUAGE: beli/bayar/gaji/terima ===
    const amount = parseAmount(text);
    if (!amount) {
      return bot.sendMessage(chatId, 
        '❌ Format tidak dikenali.\n\n' +
        'Gunakan:\n' +
        '• `B <deskripsi> <jumlah>` — expense\n' +
        '• `J <deskripsi> <jumlah>` — income\n' +
        '• `beli/bayar/gaji <deskripsi> <jumlah>`',
        { parse_mode: 'Markdown' }
      );
    }

    // Detect type from keywords
    const expenseKeywords = ['beli', 'bayar', 'belanja', 'keluar', 'beliin', 'ngebayar'];
    const incomeKeywords = ['gaji', 'terima', 'masuk', 'dapat', 'jual', 'income', 'pendapatan'];

    const isExpense = expenseKeywords.some(k => lowerText.includes(k));
    const isIncome = incomeKeywords.some(k => lowerText.includes(k));

    if (!isExpense && !isIncome) {
      return bot.sendMessage(chatId,
        '❓ Jumlah terdeteksi tapi tipe tidak jelas.\n' +
        'Gunakan `B` (beli) atau `J` (jual) di awal pesan.',
        { parse_mode: 'Markdown' }
      );
    }

    const finalAmount = isExpense ? -Math.abs(amount) : amount;
    const category = isExpense ? DEFAULT_CATEGORY : 'Gaji';

    const result = await saveTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: finalAmount,
      payee: text,
      category,
      notes: 'Auto-detect: ' + (isExpense ? 'expense' : 'income')
    });

    const emoji = isExpense ? '💸' : '💰';
    return bot.sendMessage(chatId,
      `${emoji} *AUTO-DETECT ${isExpense ? 'EXPENSE' : 'INCOME'}*\n` +
      `Original: ${text}\n` +
      `Amount: ${formatRupiah(amount)}\n` +
      `Category: ${category}\n` +
      `Status: ✅ Saved (ID: ${result?.id || 'N/A'})`,
      { parse_mode: 'Markdown' }
    );

  } catch (error) {
    console.error('[TELEGRAM BOT] Error:', error);
    return bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
};

// ===== PARSERS =====
const parseAmount = (str) => {
  // Match patterns: 15k, 2jt, 500rb, 1.5jt, 1000, 1,500
  const normalized = str.toLowerCase()
    .replace(/,/g, '') // remove thousand separators
    .replace(/\./g, '.'); // keep decimal point

  const match = normalized.match(/(\d+(?:\.\d+)?)\s*(k|jt|juta|rb|ribu)?/i);
  if (!match) return null;

  let num = parseFloat(match[1]);
  const suffix = match[2] || '';

  if (suffix === 'k') num *= 1000;
  else if (suffix === 'jt' || suffix === 'juta') num *= 1000000;
  else if (suffix === 'rb' || suffix === 'ribu') num *= 1000;

  return Math.round(num);
};

const formatRupiah = (num) => {
  return 'Rp ' + num.toLocaleString('id-ID');
};

// ===== API =====
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

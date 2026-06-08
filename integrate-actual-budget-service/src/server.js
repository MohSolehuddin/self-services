require('dotenv').config();
const app = require('./app');
const config = require('./config');
const { startBot } = require('./telegram-bot');

const PORT = config.PORT;
const ACTUAL_BASE_URL = config.ACTUAL_BASE_URL;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
    console.log(`Terhubung ke Actual Budget di: ${ACTUAL_BASE_URL}`);
    console.log(`TELEGRAM_BOT_TOKEN tersedia: ${process.env.TELEGRAM_BOT_TOKEN ? '✅' : '❌'}`);
  });

  startBot();
};

startServer();

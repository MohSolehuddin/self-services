// Centralized configuration for integrate-actual-budget-service
require('dotenv').config();

module.exports = {
  // Budget Service
  PORT: process.env.PORT || 3001,
  DATABASE_PATH: process.env.DATABASE_PATH || './database.sqlite',

  // Actual Budget (HTTPS domain)
  ACTUAL_BASE_URL: process.env.ACTUAL_BASE_URL || 'https://actual-budget.msytc.my.id',
  ACTUAL_DEFAULT_PASSWORD: process.env.ACTUAL_DEFAULT_PASSWORD || 'secret',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};

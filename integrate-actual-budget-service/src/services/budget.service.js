const { pool, getUserBySenderId, getOrCreateUser, addTransaction } = require('../database');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config'));

/**
 * Get or create Actual Budget connection for a budget
 */
const getOrCreateBudget = async (senderId) => {
  try {
    let user = await getUserBySenderId(senderId);
    if (!user) {
      console.log(`Creating new user for sender_id: ${senderId}`);
      user = await getOrCreateUser(senderId, `user_${senderId}@localhost`, `User ${senderId}`);
    }

    const result = await pool.query(
      'SELECT * FROM budget_accounts WHERE user_id = $1',
      [user.id]
    );
    
    const accounts = result.rows;
    
    if (accounts.length === 0) {
      console.log(`No budget account found for user ${senderId}, creating default...`);
      const createResult = await pool.query(
        `INSERT INTO budget_accounts (user_id, budget_id, budget_name, sync_id) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [user.id, 'default', 'Default Budget', 'sync_default']
      );
      return createResult.rows[0];
    }
    
    return accounts[0];
  } catch (error) {
    console.error('Error in getOrCreateBudget:', error.message);
    throw error;
  }
};

/**
 * Process transaction from Telegram
 */
const processTransaction = async (senderId, transactionData) => {
  try {
    const budget = await getOrCreateBudget(senderId);
    
    // Save to database
    const savedTransaction = await addTransaction(budget.user_id, transactionData);
    
    return {
      success: true,
      transaction: savedTransaction,
      budgetId: budget.budget_id
    };
  } catch (error) {
    console.error('Error processing transaction:', error.message);
    throw error;
  }
};

/**
 * Export all transactions for a user to TSV format
 * Format: date\tpayee\tcategory\tamount\tnotes
 */
const exportTransactionsToTSV = async (senderId) => {
  try {
    const user = await getUserBySenderId(senderId);
    if (!user) {
      return "date\tpayee\tcategory\tamount\tnotes\nNo transactions found.";
    }

    const result = await pool.query(
      'SELECT date, payee, category, amount, notes FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [user.id]
    );

    const rows = result.rows;
    
    if (rows.length === 0) {
      return "date\tpayee\tcategory\tamount\tnotes\nNo transactions found.";
    }

    // TSV header
    let tsv = "date\tpayee\tcategory\tamount\tnotes\n";
    
    // Add rows
    for (const row of rows) {
      const amount = row.amount ? (row.amount < 0 ? row.amount : `+${row.amount}`) : '';
      tsv += `${row.date}\t${row.payee || ''}\t${row.category || ''}\t${amount}\t${row.notes || ''}\n`;
    }
    
    return tsv;
  } catch (error) {
    console.error('Error exporting TSV:', error.message);
    throw error;
  }
};

/**
 * Export all transactions for a user to CSV format
 */
const exportTransactionsToCSV = async (senderId) => {
  try {
    const user = await getUserBySenderId(senderId);
    if (!user) {
      return "date,payee,category,amount,notes\nNo transactions found.";
    }

    const result = await pool.query(
      'SELECT date, payee, category, amount, notes FROM transactions WHERE user_id = $1 ORDER BY date DESC',
      [user.id]
    );

    const rows = result.rows;
    
    if (rows.length === 0) {
      return "date,payee,category,amount,notes\nNo transactions found.";
    }

    // CSV header
    let csv = "date,payee,category,amount,notes\n";
    
    // Add rows (escape quotes by doubling them, wrap in quotes if contains comma)
    for (const row of rows) {
      const escape = (val) => {
        if (val === null || val === undefined) return '';
        const str = String(val);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };
      const amount = row.amount ? (row.amount < 0 ? row.amount : `+${row.amount}`) : '';
      csv += `${escape(row.date)},${escape(row.payee)},${escape(row.category)},${escape(amount)},${escape(row.notes)}\n`;
    }
    
    return csv;
  } catch (error) {
    console.error('Error exporting CSV:', error.message);
    throw error;
  }
};

module.exports = {
  getOrCreateBudget,
  processTransaction,
  exportTransactionsToTSV,
  exportTransactionsToCSV
};

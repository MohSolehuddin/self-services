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

module.exports = {
  getOrCreateBudget,
  processTransaction
};

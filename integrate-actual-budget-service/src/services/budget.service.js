const { db, getUserBySenderId, getOrCreateUser, addTransaction } = require('../database');
const path = require('path');
const config = require(path.join(__dirname, '..', 'config'));

// In-memory cache for Actual Budget connections
const budgetConnections = new Map();

/**
 * Get or create Actual Budget connection for a budget
 */
const getBudgetConnection = async (budgetId) => {
  if (!budgetId) {
    throw new Error('Budget ID is required');
  }

  if (budgetConnections.has(budgetId)) {
    return budgetConnections.get(budgetId);
  }

  // Create new connection (for now, return a placeholder)
  const connection = {
    id: budgetId,
    baseUrl: config.ACTUAL_BASE_URL,
    accounts: [],
    categories: []
  };

  budgetConnections.set(budgetId, connection);
  return connection;
};

/**
 * Get or create user's budget structure
 */
const getOrCreateBudget = async (senderId) => {
  try {
    // Auto-create user if not exists
    let user = await getUserBySenderId(senderId);
    if (!user) {
      console.log(`Creating new user for sender_id: ${senderId}`);
      user = await getOrCreateUser(senderId, `user_${senderId}@localhost`, `User ${senderId}`);
    }

    // Check if budget exists in our local records
    const accountRows = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM budget_accounts WHERE user_id = ?',
        [user.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    if (accountRows.length > 0) {
      console.log(`Budget already exists for ${senderId}: ${accountRows.length} accounts`);
      return {
        budgetId: user.id,
        accounts: accountRows,
        userId: user.id,
        email: user.email
      };
    }

    // Create default accounts if none exist
    console.log(`Creating default budget for ${senderId}`);
    await createDefaultBudgetStructure(user.id);
    
    return {
      budgetId: user.id,
      accounts: await getAccounts(senderId),
      userId: user.id,
      email: user.email
    };
  } catch (error) {
    console.error(`Error in getOrCreateBudget for ${senderId}:`, error.message);
    throw error;
  }
};

/**
 * Create default budget structure (accounts) for a new user
 */
const createDefaultBudgetStructure = async (userId) => {
  const defaultAccounts = [
    { name: 'Cash', type: 'cash', onBudget: true },
    { name: 'Checking', type: 'checking', onBudget: true },
    { name: 'Savings', type: 'savings', onBudget: true },
    { name: 'Credit Card', type: 'credit_card', onBudget: false }
  ];

  const createdAccounts = [];
  
  for (const account of defaultAccounts) {
    try {
      db.run(
        'INSERT INTO budget_accounts (user_id, actual_account_id, name, type, on_budget) VALUES (?, ?, ?, ?, ?)',
        [userId, `local_${Date.now()}_${Math.floor(Math.random()*1000)}`, account.name, account.type, account.on_budget],
        function(err) {
          if (err) console.error(`Error creating account ${account.name}:`, err);
          else createdAccounts.push({ id: this.lastID, ...account });
        }
      );
    } catch (error) {
      console.error(`Error creating account ${account.name}:`, error.message);
    }
  }

  return createdAccounts;
};

/**
 * Get all accounts for a user
 */
const getAccounts = async (senderId) => {
  try {
    const user = await getUserBySenderId(senderId);
    if (!user) {
      throw new Error(`User not found for sender_id: ${senderId}`);
    }

    return new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM budget_accounts WHERE user_id = ?',
        [user.id],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  } catch (error) {
    console.error(`Error fetching accounts for ${senderId}:`, error.message);
    throw error;
  }
};

/**
 * Get all categories for a user
 */
const getCategories = async (senderId) => {
  try {
    const user = await getUserBySenderId(senderId);
    if (!user) {
      throw new Error(`User not found for sender_id: ${senderId}`);
    }
    
    const budgetId = user.budget_id;
    if (!budgetId) {
      // Return default categories if no budget created yet
      return [
        { id: 'cat_food', name: 'Food' },
        { id: 'cat_transport', name: 'Transportation' },
        { id: 'cat_utility', name: 'Utilities' },
        { id: 'cat_entertainment', name: 'Entertainment' },
        { id: 'cat_health', name: 'Health' },
        { id: 'cat_shopping', name: 'Shopping' }
      ];
    }
    
    // Return default categories for now
    // In production, fetch from Actual Budget API
    return [
      { id: 'cat_food', name: 'Food' },
      { id: 'cat_transport', name: 'Transportation' },
      { id: 'cat_utility', name: 'Utilities' },
      { id: 'cat_entertainment', name: 'Entertainment' },
      { id: 'cat_health', name: 'Health' },
      { id: 'cat_shopping', name: 'Shopping' }
    ];
  } catch (error) {
    console.error(`Error fetching categories for ${senderId}:`, error.message);
    // Return default categories as fallback
    return [
      { id: 'cat_food', name: 'Food' },
      { id: 'cat_transport', name: 'Transportation' },
      { id: 'cat_utility', name: 'Utilities' },
      { id: 'cat_entertainment', name: 'Entertainment' },
      { id: 'cat_health', name: 'Health' },
      { id: 'cat_shopping', name: 'Shopping' }
    ];
  }
};

/**
 * Sync transaction to SQLite database
 */
const syncTransaction = async (senderId, transactionData) => {
  try {
    let user = await getUserBySenderId(senderId);
    if (!user) {
      // Create new user if not exists
      user = await getOrCreateUser(senderId, `user_${senderId}@localhost`, `User ${senderId}`);
    }

    const result = await addTransaction(user.id, transactionData);
    return result;
  } catch (error) {
    console.error(`Error syncing transaction for ${senderId}:`, error.message);
    throw error;
  }
};

/**
 * Process parsed transaction and save to database
 */
const processTransaction = async (senderId, parsedTransaction) => {
  try {
    console.log(`Processing transaction for ${senderId}:`, parsedTransaction);
    
    // Get or create budget
    const budgetInfo = await getOrCreateBudget(senderId);
    const budgetId = budgetInfo.budgetId;
    
    // Save to SQLite
    const result = await syncTransaction(senderId, {
      ...parsedTransaction,
      payee: parsedTransaction.payee || 'Unknown',
      amount: parsedTransaction.amount || 0
    });
    
    return {
      success: true,
      sqliteTransactionId: result.id,
      budgetId: budgetId
    };
  } catch (error) {
    console.error(`Error processing transaction for ${senderId}:`, error.message);
    throw error;
  }
};

module.exports = {
  getOrCreateBudget,
  createDefaultBudgetStructure,
  getAccounts,
  getCategories,
  syncTransaction,
  processTransaction
};

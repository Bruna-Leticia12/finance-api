const express = require('express');
const router = express.Router();

const {
  createAccount,
  getBalance,
  createTransaction,
  listTransactions
} = require('../controllers/accountController');

// POST /api/accounts
router.post('/', createAccount);

// GET /api/accounts/:id/balance
router.get('/:id/balance', getBalance);

// POST /api/accounts/:id/transactions
router.post('/:id/transactions', createTransaction);

// GET /api/accounts/:id/transactions
router.get('/:id/transactions', listTransactions);

module.exports = router;
const express = require('express');
const router = express.Router();

const {
  createAccount,
  getBalance,
  createTransaction,
  listTransactions,
  updateAuthorization,
  getAccountDetails
} = require('../controllers/accountController');

// POST /api/accounts
router.post('/', createAccount);

// POST /api/accounts/:id/transactions
router.post('/:id/transactions', createTransaction);

// GET /api/accounts/:id/transactions
router.get('/:id/transactions', listTransactions);

// GET /api/accounts/:id/balance
router.get('/:id/balance', getBalance);

// PATCH /api/accounts/:id/authorization
router.patch('/:id/authorization', updateAuthorization);

// IMPORTANT: rota genérica deve vir por último para não conflitar com as anteriores
// GET /api/accounts/:id  (detalhes da conta + dados do customer se autorizado)
router.get('/:id', getAccountDetails);

module.exports = router;

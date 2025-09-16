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

router.post('/', createAccount);

router.post('/:id/transactions', createTransaction);

router.get('/:id/transactions', listTransactions);

router.get('/:id/balance', getBalance);

router.patch('/:id/authorization', updateAuthorization);

router.get('/:id', getAccountDetails);

module.exports = router;
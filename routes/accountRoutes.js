import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';

import {
  createAccount,
  getBalance,
  createTransaction,
  listTransactions,
  updateAuthorization,
  getAccountDetails
} from '../controllers/accountController.js';

router.use(authMiddleware);

router.post('/', createAccount);
router.post('/transactions', createTransaction);
router.get('/:id/transactions', listTransactions);
router.get('/:id/balance', getBalance);
router.patch('/:id/authorization', updateAuthorization);
router.get('/:id', getAccountDetails);

export default router;

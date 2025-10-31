import express from 'express';
const router = express.Router();

import authMiddleware from '../middlewares/authMiddleware.js';

import {
  createTransaction,
  listTransactions,
} from '../controllers/accountController.js';

router.use(authMiddleware);

router.post('/', createTransaction);
router.get('/:id', listTransactions);

export default router;
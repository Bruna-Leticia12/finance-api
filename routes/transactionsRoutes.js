import express from 'express';
const router = express.Router();

import {
  createTransaction,
  listTransactions,
} from '../controllers/accountController.js';

router.post('/', createTransaction);
router.get('/:id', listTransactions);

export default router;
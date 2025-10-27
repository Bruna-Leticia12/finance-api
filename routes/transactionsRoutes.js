const express = require('express');
const router = express.Router();

const {
  createTransaction,
  listTransactions,

} = require('../controllers/accountController');

router.post('/', createTransaction);

router.get('/:id', listTransactions);

module.exports = router;
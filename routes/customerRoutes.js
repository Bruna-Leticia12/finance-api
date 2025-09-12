const express = require('express');
const router = express.Router();
const { createCustomer } = require('../controllers/customerController');

// POST /api/customers
router.post('/', createCustomer);

module.exports = router;
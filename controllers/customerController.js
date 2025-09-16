const { createCustomerService } = require('../services/customerService');

async function createCustomer(req, res) {
  try {
    const customer = await createCustomerService(req.body);
    return res.status(201).json(customer);
  } catch (err) {
    console.error('Erro em createCustomer:', err.message);
    return res.status(400).json({ error: err.message });
  }
}

module.exports = {
  createCustomer
};
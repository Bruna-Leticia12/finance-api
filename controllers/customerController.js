const Customer = require('../models/Customer');
const { extractCpfDigits, isValidCpf } = require('../utils/validators');

async function createCustomer(req, res) {
  try {

    const { name, cpf, email } = req.body;

    if (!name || !cpf || !email) {
      return res.status(400).json({ error: 'nome, cpf e email são obrigatórios' });
    }

    const cleanCpf = extractCpfDigits(cpf);
    if (!isValidCpf(cleanCpf)) {
      return res.status(400).json({ error: 'CPF inválido' });
    }

    const customer = await Customer.create({
      name: String(name).trim(),
      cpf: cleanCpf,
      email: String(email).trim().toLowerCase()
    });

    return res.status(201).json(customer);

  } catch (err) {

    if (err?.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'campo único';
      return res.status(409).json({ error: `Já existe um registro com esse ${field}` });
    }
    console.error('Erro em createCustomer:', err);
    return res.status(500).json({ error: 'Erro interno ao criar cliente' });
  }
}

module.exports = {
  createCustomer
};
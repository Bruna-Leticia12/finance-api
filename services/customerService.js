const Customer = require('../models/Customer');
const { extractCpfDigits, isValidCpf } = require('../utils/validators');

async function createCustomerService({ name, cpf, email }) {
  if (!name || !cpf || !email) {
    throw new Error('name, cpf, and email are required');
  }

  const cleanCpf = extractCpfDigits(cpf);
  if (!isValidCpf(cleanCpf)) {
    throw new Error('Invalid CPF');
  }

  const customer = await Customer.create({
    name: String(name).trim(),
    cpf: cleanCpf,
    email: String(email).trim().toLowerCase()
  });

  return customer;
}

module.exports = {
  createCustomerService
};
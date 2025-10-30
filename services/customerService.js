import Customer from '../models/Customer.js';
import { extractCpfDigits, isValidCpf } from '../utils/validators.js';

async function createCustomerService({ name, cpf, email, password }) {
  if (!name || !cpf || !email) {
    throw new Error('name, cpf, and email are required');
  }

  const cleanCpf = extractCpfDigits(cpf);
  if (!isValidCpf(cleanCpf)) {
    throw new Error('Invalid CPF');
  }

  const exists = await Customer.findOne({ $or: [{ cpf: cleanCpf }, { email: String(email).trim().toLowerCase() }] });
  if (exists) {
    throw new Error('Customer with same CPF or email already exists');
  }

  const payload = {
    name: String(name).trim(),
    cpf: cleanCpf,
    email: String(email).trim().toLowerCase()
  };

  if (password) payload.password = password;

  const customer = await Customer.create(payload);

  return customer;
}

async function getCustomerById(id) {
  const customer = await Customer.findById(id).lean();
  if (!customer) throw new Error('Customer not found');
  return customer;
}

async function getAllCustomers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const customers = await Customer.find().skip(skip).limit(limit).lean();
  const total = await Customer.countDocuments();
  return { page, limit, total, customers };
}

async function updateCustomer(id, data) {
  if (!id) throw new Error('id is required');
  const customer = await Customer.findByIdAndUpdate(id, data, { new: true }).lean();
  if (!customer) throw new Error('Customer not found');
  return customer;
}

async function deleteCustomer(id) {
  if (!id) throw new Error('id is required');
  const res = await Customer.findByIdAndDelete(id);
  if (!res) throw new Error('Customer not found');
  return;
}

export default {
  createCustomerService,
  getCustomerById,
  getAllCustomers,
  updateCustomer,
  deleteCustomer
};
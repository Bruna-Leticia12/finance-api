import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import Customer from '../models/Customer.js';
import customerService from '../services/customerService.js';

import { createAndGenerateKey } from '../services/consentService.js';
import {
  BadRequestError,
  UnauthorizedError,
  ApiError,
} from '../exceptions/api-errors.js';
import { extractCpfDigits } from '../utils/validators.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3d';

export async function createCustomer(req, res, next) {
  try {
    const { name, email, cpf, password } = req.body;

    if (!name || !email || !cpf || !password) {
      throw new BadRequestError('Name, email, CPF, and password are required.');
    }

    const cleanCpf = extractCpfDigits(cpf);
    if (!cleanCpf) throw new BadRequestError('Invalid CPF.');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCustomer = await customerService.createCustomerService({
      name,
      email,
      cpf: cleanCpf,
      password: hashedPassword,
    });

    return res.status(201).json(newCustomer);
  } catch (error) {
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { cpf, password } = req.body;
    const { connectionId, callbackUrl } = req.query;

    if (!cpf || !password) {
      throw new BadRequestError('CPF and password are required.');
    }

    const cleanCpf = extractCpfDigits(cpf);
    if (!cleanCpf) throw new BadRequestError('Invalid CPF.');

    const customer = await Customer.findOne({ cpf: cleanCpf }).select(
      '+password'
    );
    if (!customer) {
      throw new UnauthorizedError('Invalid CPF or password.');
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid CPF or password.');
    }

    // Fluxo de conexão (ex: ControlF)
    if (connectionId && callbackUrl) {
      const controlFResponse = await handleControlFConnection(
        connectionId,
        customer._id,
        callbackUrl
      );
      return res.status(200).json(controlFResponse);
    }

    const token = jwt.sign({ id: customer._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    return res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    return next(error);
  }
}

async function handleControlFConnection(connectionId, customerId, callbackUrl) {
  const { plainApiKey, userIdInChildApi } = await createAndGenerateKey({
    customerId,
  });

  if (!plainApiKey || !userIdInChildApi) {
    throw new ApiError(500, 'Failed to create consent and generate API key');
  }

  try {
    await axios.patch(
      callbackUrl,
      { apiKey: plainApiKey, userIdInChildApi, connectionId },
      { timeout: 5000 } // 5 segundos
    );
  } catch (error) {
    console.error('Failed to notify ControlF:', error.message);
    throw new ApiError(
      502, 
      `Failed to notify the callback URL. Status: ${
        error.response?.status || 'N/A'
      }`
    );
  }

  return {
    message: 'ControlF connection established',
    customerId,
    _plainApiKeyForTesting: plainApiKey,
  };
}

export async function getAllCustomers(req, res, next) {
  try {
    const customers = await Customer.find().select('-password');
    return res.json(customers);
  } catch (err) {
    return next(err);
  }
}

export async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id).select('-password');
    if (!customer) throw new ApiError(404, 'Customer not found.');
    return res.json(customer);
  } catch (err) {
    return next(err);
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    ).select('-password');
    if (!customer) throw new ApiError(404, 'Customer not found.');
    return res.json({ message: 'Customer successfully updated.', customer });
  } catch (err) {
    return next(err);
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) throw new ApiError(404, 'Customer not found.');
    return res.json({ message: 'Customer successfully deleted.' });
  } catch (err) {
    return next(err);
  }
}

export default {
  createCustomer,
  login,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
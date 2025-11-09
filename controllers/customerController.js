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
      throw new BadRequestError("CPF and password are required");
    }
    const customer = await Customer.findOne({ cpf }).select('+password');
    if (!customer) {
      throw new UnauthorizedError("Invalid CPF or password");
    }
    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid CPF or password");
    }

    if (connectionId && callbackUrl) {
      const controlFResponse = await handleControlFConnection(connectionId, customer._id, callbackUrl);
      res.status(200).json(controlFResponse);
    } else {
      const token = jwt.sign({ id: customer._id }, process.env.JWT_SECRET, { expiresIn: '3d' });
      res.status(200).json({
        message: 'login successful',
        token
      });
    }
  } catch (error) {
    next(error)
  }
}

export async function handleControlFConnection(connectionId, customerId, callbackUrl, next) {
  try {
    const { plainApiKey, userIdInChildApi, consentId } = await createAndGenerateKey({ customer: customerId });
    if (!plainApiKey || !userIdInChildApi) {
      throw new Error("Failed to create external consent and generate API key");
    }

    const response = await axios.patch(callbackUrl, {
      apiKey: plainApiKey,
      userIdInChildApi,
      connectionId,
      consentIdInChildApi: consentId
    },
     {
      headers: {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGViZWUzOTcxMTU2MDkyNjI4NmQ1OCIsImlhdCI6MTc2MjYzNjcyNywiZXhwIjoxNzYyNjQwMzI3fQ.vVmQE9yhJFS4skvTYWBI56KuWAyG2JmEM5bJ_gXzfCI",
      },
    }
  );

    if (response.status !== 200) {
      throw new Error(`Failed to notify ControlF. Status code: ${response.status}`);
    }

    return {
      message: 'ControlF connection established',
      customerId
    };

  } catch (err) {
    next(err);
  }
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
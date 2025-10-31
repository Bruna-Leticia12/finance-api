import crypto from 'crypto';
import mongoose from 'mongoose';
import Consent from '../models/Consent.js';
import Customer from '../models/Customer.js';
import { ApiError } from '../exceptions/api-errors.js';

export async function createAndGenerateKey({ customerId }) {
  if (!mongoose.isValidObjectId(customerId)) {
    throw new ApiError(400, 'Invalid customer ID.');
  }
  const customer = await Customer.findById(customerId);
  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }
  const plainApiKey = crypto.randomBytes(32).toString('hex');
  const hashedApiKey = crypto
    .createHash('sha256')
    .update(plainApiKey)
    .digest('hex');
  // Data de expiração (1 ano)
  const expirationDateTime = new Date();
  expirationDateTime.setFullYear(expirationDateTime.getFullYear() + 1);

  const permissions = [
    'ACCOUNTS_READ',
    'ACCOUNTS_BALANCES_READ',
    'TRANSACTIONS_READ',
    'CUSTOMERS_PERSONAL_IDENTIFICATIONS_READ',
  ];
  await Consent.create({
    customer: customerId,
    status: 'AUTHORIZED', 
    permissions,
    expirationDateTime,
    apiKey: hashedApiKey,
  });
  return { plainApiKey, userIdInChildApi: customerId.toString() };
}

export async function verifyApiKeyService(plainApiKey) {
  if (!plainApiKey) {
    return null;
  }
  const hashedApiKey = crypto
    .createHash('sha256')
    .update(plainApiKey)
    .digest('hex');

  const consent = await Consent.findOne({ apiKey: hashedApiKey });
  if (!consent) {
    return null; 
  }
  if (consent.status !== 'AUTHORIZED') {
    return null;
  }
  if (consent.expirationDateTime && consent.expirationDateTime < new Date()) {
    consent.status = 'EXPIRED';
    await consent.save();
    return null;
  }
  return consent;
}

export async function getCustomerConsents(customerId) {
  return Consent.find({ customer: customerId }).sort({ createdAt: -1 });
}

export async function getConsentById(consentId, customerId) {
  if (!mongoose.isValidObjectId(consentId)) {
    throw new ApiError(400, 'Invalid consent ID.');
  }
  const consent = await Consent.findOne({ _id: consentId, customer: customerId });
  if (!consent) {
    throw new ApiError(404, 'Consent not found.');
  }
  return consent;
}

export async function revokeConsent(consentId, customerId) {
  const consent = await getConsentById(consentId, customerId);
  if (consent.status === 'REVOKED') {
    return consent;
  }
  consent.status = 'REVOKED';
  await consent.save();
  return consent;
}

export default {
  createAndGenerateKey,
  verifyApiKeyService,
  getCustomerConsents,
  getConsentById,
  revokeConsent,
};
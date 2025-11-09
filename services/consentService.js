import crypto from 'crypto';
import mongoose from 'mongoose';
import Consent from '../models/Consent.js';
import Customer from '../models/Customer.js';
import { ApiError } from '../exceptions/api-errors.js';
import bcrypt from "bcryptjs";

export async function createAndGenerateKey({ customer }) {
  if (!mongoose.isValidObjectId(customer)) {
    throw new ApiError(400, 'Invalid customer ID.');
  }
  const customerFound = await Customer.findById(customer._id);
  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }
  const plainApiKey = crypto.randomBytes(32).toString('hex');
  const salt = await bcrypt.genSalt(10);
  const hashedApiKey = await bcrypt.hash(plainApiKey, salt);
  

  const consent = await Consent.create({
    customer: customerFound._id,
    apiKey: hashedApiKey,
    status: 'AUTHORIZED', 
  });
  
  return { 
    plainApiKey, 
    userIdInChildApi: customerFound,
    consentId: String(consent._id)
  };
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
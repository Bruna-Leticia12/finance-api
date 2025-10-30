import crypto from 'crypto';
import Consent from '../models/Consent.js';
import Customer from '../models/Customer.js';

export async function createConsent(customerId) {
  const customer = await Customer.findById(customerId);
  if (!customer) throw new Error('Customer not found.');

  const plainApiKey = crypto.randomBytes(24).toString('hex');
  const apiKeyHash = crypto.createHash('sha256').update(plainApiKey).digest('hex');

  const expirationDateTime = new Date();
  expirationDateTime.setDate(expirationDateTime.getDate() + 30);

  const consent = await Consent.create({
    customer: customer._id,
    apiKey: apiKeyHash,
    plainApiKey,
    status: 'AUTHORIZED',
    expirationDateTime
  });

  return { consent, plainApiKey };
}

export async function getConsentsByCustomer(customerId) {
  return Consent.find({ customer: customerId });
}

export async function revokeConsent(consentId, customerId) {
  const consent = await Consent.findOne({ _id: consentId, customer: customerId });
  if (!consent) throw new Error('Consent not found.');

  consent.status = 'REVOKED';
  await consent.save();
  return consent;
}

export async function verifyApiKeyService(apiKey) {
  const apiKeyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  return Consent.findOne({ apiKey: apiKeyHash, status: 'AUTHORIZED' });
}

export async function createAndGenerateKey({ customer }) {
  const r = await this.createConsent(customer);
  return { plainApiKey: r.plainApiKey, userIdInChildApi: r.consent._id };
}

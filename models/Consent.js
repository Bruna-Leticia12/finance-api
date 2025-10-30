import mongoose from 'mongoose';

const consentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  status: { type: String, enum: ['AUTHORIZED', 'REVOKED'], default: 'AUTHORIZED' },
  expirationDateTime: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  permissions: { type: [String], default: ['ACCOUNTS_READ', 'TRANSACTIONS_READ'] },
  apiKey: { type: String, required: true },
  plainApiKey: { type: String }
}, { timestamps: true });

export default mongoose.model('Consent', consentSchema);
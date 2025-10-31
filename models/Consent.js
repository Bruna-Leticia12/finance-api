import mongoose from 'mongoose';
import crypto from 'crypto';

const consentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['AWAITING_AUTHORIZATION', 'AUTHORIZED', 'REVOKED', 'EXPIRED'],
      default: 'AWAITING_AUTHORIZATION',
      required: true,
    },
    permissions: [
      {
        type: String,
        enum: [
          'ACCOUNTS_READ',
          'ACCOUNTS_BALANCES_READ',
          'TRANSACTIONS_READ',
          'CUSTOMERS_PERSONAL_IDENTIFICATIONS_READ',
        ],
        required: true,
      },
    ],
    expirationDateTime: {
      type: Date,
      required: true,
    },
    apiKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        delete ret.apiKey; 
        return ret;
      },
    },
  }
);

consentSchema.methods.compareApiKey = function (plainApiKey) {
  if (!plainApiKey || !this.apiKey) {
    return false;
  }
  const hashedApiKey = crypto
    .createHash('sha256')
    .update(plainApiKey)
    .digest('hex');
  return this.apiKey === hashedApiKey;
};

export default mongoose.model('Consent', consentSchema);
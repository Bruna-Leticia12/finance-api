import mongoose from 'mongoose';
import crypto from 'crypto';

const consentSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      ref: 'Customer',
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'AUTHORIZED', 'REVOKED', 'UNAUTHORIZED'],
      default: 'UNAUTHORIZED',
      required: true,
    },    
    expirationDateTime: {
        type: Date,
        default: () => 
            new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    },
    apiKey: {
      type: String,
      required: false,
      unique: true,
    },
  },
  {
    timestamps: true,   
  },  
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
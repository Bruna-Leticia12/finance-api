const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['checking', 'savings'],
      required: [true, 'Tipo da conta é obrigatório']
    },
    branch: {
      type: String,
      required: [true, 'Agência é obrigatória'],
      trim: true
    },
    number: {
      type: String,
      required: [true, 'Número da conta é obrigatório'],
      trim: true
    },
    balance: {
      type: Number,
      default: 0
    },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }
    ],
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    bankId: {
      type: String,
      required: [true, 'bankId é obrigatório'],
      trim: true
    },
    sharingAllowed: {
      type: Boolean,
      required: [true, 'sharingAllowed é obrigatório']
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

accountSchema.index({ branch: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Account', accountSchema);

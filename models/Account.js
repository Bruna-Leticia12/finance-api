const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['checking', 'savings'],
      required: [true]
    },
    branch: {
      type: String,
      required: [true],
      trim: true
    },
    number: {
      type: String,
      required: [true],
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
      required: [true],
      trim: true
    },
    sharingAllowed: {
      type: Boolean,
      required: [true]
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
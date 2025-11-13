import mongoose from 'mongoose';

export const TransactionCategory = Object.freeze({
  RENDA: 'RENDA',
  DESPESA_FIXA: 'DESPESA FIXA',
  POUPAR: 'POUPAR',
  LAZER: 'LAZER',
  IMPREVISTOS: 'IMPREVISTOS'
});

function isValidDateFormat(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const transactionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Date is required'],
      validate: {
        validator: isValidDateFormat,
        message: 'Date must be in the YYYY-MM-DD format'
      }
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative.'],
      max: [1000000, 'Amount exceeds the maximum limit.'],
      validate: {
        validator: function (v) {
          return /^\d+(\.\d{1,2})?$/.test(v.toString());
        },
        message: props => `${props.value} is not a valid amount.`
      }
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: [true, 'Transaction type is required']
    },
    category: {
      type: String,
      enum: Object.values(TransactionCategory),
      required: [true, 'Category is required'],
      trim: true,
      set: value => value?.toUpperCase()
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: true
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

transactionSchema.pre('validate', function (next) {
  if (this.category) {
    const upper = this.category.toUpperCase().trim();
    if (!Object.values(TransactionCategory).includes(upper)) {
      return next(
        new Error(
          `Invalid category '${this.category}'. Allowed values: ${Object.values(TransactionCategory).join(', ')}`
        )
      );
    }
    this.category = upper;
  }
  next();
});

Object.freeze(TransactionCategory);

export default mongoose.model('Transaction', transactionSchema);
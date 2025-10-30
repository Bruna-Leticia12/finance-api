import mongoose from 'mongoose';

function isValidDateFormat(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const transactionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true],
      validate: {
        validator: isValidDateFormat,
        message: 'Date must be in the YYYY-MM-DD format'
      }
    },
    description: {
      type: String,
      required: [true],
      trim: true
    },
    amount: {
      type: Number,
      required: [true],
      min: [0, 'Amount cannot be negative.'],
      max: [1000000],
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
      required: [true]
    },
    category: {
      type: String,
      default: 'General',
      trim: true
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

export default mongoose.model('Transaction', transactionSchema);
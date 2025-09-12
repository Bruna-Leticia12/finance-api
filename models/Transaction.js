const mongoose = require('mongoose');

function isValidDateFormat(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

const transactionSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: [true, 'Data é obrigatória (YYYY-MM-DD)'],
      validate: {
        validator: isValidDateFormat,
        message: 'Data deve estar no formato YYYY-MM-DD'
      }
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Valor é obrigatório'],
      min: [0, 'Valor não pode ser negativo']
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: [true, 'Tipo é obrigatório']
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

module.exports = mongoose.model('Transaction', transactionSchema);
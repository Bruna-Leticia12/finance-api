const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true],
      trim: true,
      minlength: [5],
      maxLength: [100],
      match: [/^[A-Za-zÀ-ÿ\s]+$/, 'O nome não pode conter números ou caracteres especiais.']
    },
    cpf: {
      type: String,
      required: [true],
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: [true],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'E-mail inválido.']
    },
    accounts: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }
    ]
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

module.exports = mongoose.model('Customer', customerSchema);
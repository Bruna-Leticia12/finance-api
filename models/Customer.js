import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true],
      trim: true,
      minlength: [5],
      maxLength: [100],
      match: [/^[A-Za-zÀ-ÿ\s]+$/, 'Name cannot contain numbers or special characters.']
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
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email.']
    },
    password: {
      type: String,
      required: true,
      select: false
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
        delete ret.password;
        return ret;
      }
    }
  }
);

export default mongoose.model('Customer', customerSchema);
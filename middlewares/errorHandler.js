import { ApiError } from '../exceptions/api-errors.js';

export default function errorHandler(err, req, res, next) {
  console.error('Error captured by errorHandler:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.code && err.code === 11000) {
    return res.status(400).json({ message: 'Duplicate key error', details: err.keyValue });
  }

  return res.status(500).json({ message: 'Internal server error' });
}

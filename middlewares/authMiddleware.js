import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../exceptions/api-errors.js';

export default async function (req, _, next) {
  const authHeader = req.headers['authorization'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    if (token) {
      try {
        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedPayload;
        return next();
      } catch (err) {
        return next(new UnauthorizedError('Token JWT inválido ou expirado.'));
      }
    }
  }

  return next(new UnauthorizedError('Autenticação necessária. Forneça um Token JWT ou API Key válida.'));
};

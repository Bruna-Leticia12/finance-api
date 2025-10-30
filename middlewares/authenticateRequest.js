import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Consent from '../models/Consent.js';
import { UnauthorizedError, ForbiddenError } from '../exceptions/api-errors.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export default async function authenticateRequest(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const apiKeyHeader = req.headers['x-api-key'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decodedPayload = jwt.verify(token, JWT_SECRET);
        req.user = decodedPayload;
        return next();
      } catch (err) {
        return next(new UnauthorizedError('Invalid or expired JWT token.'));
      }
    }

    if (apiKeyHeader) {
      // stored apiKey is hashed; hash incoming api key before lookup
      const apiKeyHash = crypto.createHash('sha256').update(apiKeyHeader).digest('hex');
      const consent = await Consent.findOne({ apiKey: apiKeyHash }).exec();
      if (!consent) {
        return next(new ForbiddenError('Invalid API Key.'));
      }

      if (consent.status !== 'AUTHORIZED') {
        return next(new ForbiddenError('Consent not authorized.'));
      }

      if (consent.expirationDateTime && consent.expirationDateTime <= new Date()) {
        return next(new ForbiddenError('API Key expired.'));
      }

      req.consentInfo = {
        consentId: consent._id,
        customerId: consent.customer,
        permissions: consent.permissions || []
      };
      return next();
    }

    return next(new UnauthorizedError('Authentication required. Provide a valid JWT Token or API Key.'));
  } catch (err) {
    return next(err);
  }
};
import { UnauthorizedError, ForbiddenError } from '../exceptions/api-errors.js';
import { verifyApiKeyService } from '../services/consentService.js';

export async function verifyApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedError('API key is missing');
    }

    const validApiKeys = (process.env.VALID_API_KEYS || '')
      .split(',')
      .map(k => k.trim())
      .filter(Boolean);

    if (validApiKeys.includes(apiKey)) {
      return next();
    }

    const consent = await verifyApiKeyService(apiKey);
    if (!consent) {
      throw new ForbiddenError('Invalid or revoked API key');
    }

    req.consent = consent;
    next();
  } catch (error) {
    next(error);
  }
}

export default { verifyApiKey };
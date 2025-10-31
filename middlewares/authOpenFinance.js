import { UnauthorizedError, ForbiddenError } from '../exceptions/api-errors.js';
import { verifyApiKeyService } from '../services/consentService.js';

export async function verifyApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      throw new UnauthorizedError('API key is missing from x-api-key header.');
    }
    const consent = await verifyApiKeyService(apiKey);
    if (!consent) {
      throw new ForbiddenError('Invalid, revoked, or expired API key.');
    }
    req.consent = consent;
    next();
  } 
  catch (error) {
    next(error);
  }
}

export default { verifyApiKey };
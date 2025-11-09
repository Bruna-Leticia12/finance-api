
import { UnauthorizedError } from '../exceptions/api-errors.js';

export default async function (req, _, next) {
  const apiKeyHeader = req.headers['x-api-key'];

  if (apiKeyHeader) {
    try {
      const consent = await ExternalConsent.findOne({ apiKey: apiKeyHeader });

      if (!consent || consent.status !== 'AUTHORIZED' || consent.expirationDateTime <= new Date()) {
        throw new ForbiddenError('API Key inválida, revogada ou expirada.');
      }

      req.consentInfo = {
        consentId: consent._id,
        customerId: consent.customer,
        permissions: consent.permissions
      };
      return next();

    } catch (error) {
      return next(error);
    }
  }
  return next(new UnauthorizedError('Autenticação necessária. Forneça um Token JWT ou API Key válida.'));
};

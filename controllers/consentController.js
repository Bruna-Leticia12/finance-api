import consentService from '../services/consentService.js';

export async function listMyConsents(req, res, next) {
  try {
    const consents = await consentService.getCustomerConsents(req.userId);
    return res.status(200).json(consents);
  } catch (error) {
    return next(error);
  }
}

export async function getMyConsentDetails(req, res, next) {
  try {
    const { id: consentId } = req.params;
    const customerId = req.userId;

    const consent = await consentService.getConsentById(consentId, customerId);
    return res.status(200).json(consent);
  } catch (error) {
    return next(error);
  }
}

export async function revokeMyConsent(req, res, next) {
  try {
    const { id: consentId } = req.params;
    const customerId = req.userId;

    const updatedConsent = await consentService.revokeConsent(
      consentId,
      customerId
    );
    return res.status(200).json({
      message: 'Consent successfully revoked.',
      consent: updatedConsent,
    });
  } catch (error) {
    return next(error);
  }
}
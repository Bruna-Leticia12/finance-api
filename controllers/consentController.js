import { createConsent } from '../services/consentService.js';

export async function create(req, res) {
  try {
    const { userId } = req;
    const result = await createConsent(userId);
    return res.status(201).json({
      message: 'Consent created successfully.',
      consentId: result.consent._id,
      plainApiKey: result.plainApiKey
    });
  } catch (error) {
    console.error('Error in create:', error.message);
    return res.status(400).json({ error: error.message });
  }
}

export async function list(req, res) {
  try {
    const { userId } = req;
    const consents = await consentService.getConsentsByCustomer(userId);
    return res.json(consents);
  } catch (error) {
    console.error('Error in list:', error.message);
    return res.status(400).json({ error: error.message });
  }
}

export async function revoke(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req;
    const consent = await consentService.revokeConsent(id, userId);
    return res.json({ message: 'Consent revoked.', consent });
  } catch (error) {
    console.error('Error in revoke:', error.message);
    return res.status(400).json({ error: error.message });
  }
}

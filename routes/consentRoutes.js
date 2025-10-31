import express from 'express';
import {
  listMyConsents,
  getMyConsentDetails,
  revokeMyConsent,
} from '../controllers/consentController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', listMyConsents);
router.get('/:id', getMyConsentDetails);
router.delete('/:id', revokeMyConsent);

export default router;
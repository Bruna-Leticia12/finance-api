import express from 'express';
import { create, list, revoke } from '../controllers/consentController.js'

const router = express.Router();

router.post('/', create);
router.get('/', list);
router.delete('/:id', revoke);

export default router;
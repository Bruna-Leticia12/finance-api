// routes/customerRoutes.js
import express from 'express';
import {
  createCustomer,
  login,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';

import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', createCustomer);    
router.post('/login', login);           

router.use(authMiddleware);

router.get('/', getAllCustomers);    
router.get('/:id', getCustomerById);   
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

export default router;

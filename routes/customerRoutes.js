import express from 'express';
import {
  createCustomer,
  login,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController.js';

const router = express.Router();

console.log('customerRoutes.js foi carregado com sucesso');

router.post('/', createCustomer);       // POST /customers
router.post('/login', login);           // POST /customers/login
router.get('/', getAllCustomers);       // GET /customers
router.get('/:id', getCustomerById);    // GET /customers/:id
router.put('/:id', updateCustomer);     // PUT /customers/:id
router.delete('/:id', deleteCustomer);  // DELETE /customers/:id

export default router;

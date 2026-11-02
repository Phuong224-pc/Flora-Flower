const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Orders
router.get('/orders', ctrl.getAllOrders);
router.patch('/orders/:id/status', ctrl.updateOrderStatus);
router.patch('/orders/:id/payment', ctrl.updateOrderPayment);

// Products
router.get('/products', ctrl.getAllProducts);
router.post('/products', ctrl.createProduct);
router.put('/products/:id', ctrl.updateProduct);
router.delete('/products/:id', ctrl.deleteProduct);

// Customers
router.get('/customers', ctrl.getAllCustomers);
router.get('/customers/:id', ctrl.getCustomerDetail);


// Coupons
router.get('/coupons', ctrl.getAllCoupons);
router.post('/coupons', ctrl.createCoupon);
router.delete('/coupons/:id', ctrl.deleteCoupon);

module.exports = router;

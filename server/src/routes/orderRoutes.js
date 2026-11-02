const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { authenticate, requireCustomer } = require('../middlewares/auth');

// ── Public: tra cứu đơn hàng không cần đăng nhập ──
router.get('/track', ctrl.trackOrder);

router.use(authenticate);

// Chỉ khách hàng (không phải admin) mới được đặt hàng
router.post('/', requireCustomer, ctrl.createOrder);

// Xem đơn của mình — admin vào qua /api/admin/orders
router.get('/my', requireCustomer, ctrl.getMyOrders);
router.get('/:id', ctrl.getOrderById);
router.patch('/:id/cancel', requireCustomer, ctrl.cancelOrder);

module.exports = router;

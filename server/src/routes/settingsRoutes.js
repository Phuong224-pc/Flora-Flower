const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/settingsController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

// Public: shop info & bank config (frontend cần để hiển thị QR)
router.get('/public', ctrl.getPublic);

// Admin only
router.get('/', authenticate, requireAdmin, ctrl.getAll);
router.put('/', authenticate, requireAdmin, ctrl.update);

module.exports = router;

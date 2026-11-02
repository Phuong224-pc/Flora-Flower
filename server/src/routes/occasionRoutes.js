const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/occasionController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

// Public
router.get('/', ctrl.getOccasions);
router.get('/:slug', ctrl.getOccasionBySlug);
router.get('/:slug/products', ctrl.getOccasionProducts);

// Admin
router.get('/admin/all', authenticate, requireAdmin, ctrl.adminGetAll);
router.post('/admin', authenticate, requireAdmin, ctrl.adminCreate);
router.put('/admin/:id', authenticate, requireAdmin, ctrl.adminUpdate);
router.delete('/admin/:id', authenticate, requireAdmin, ctrl.adminDelete);

module.exports = router;

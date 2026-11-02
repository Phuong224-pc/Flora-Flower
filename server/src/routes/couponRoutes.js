const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/couponController');
const { optionalAuth } = require('../middlewares/auth');

router.post('/check', optionalAuth, ctrl.checkCoupon);

module.exports = router;

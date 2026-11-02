const db = require('../db');

// POST /api/coupons/check — kiểm tra mã giảm giá
exports.checkCoupon = async (req, res) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Vui lòng nhập mã giảm giá' });

    const coupons = await db.Coupons.find({ code: code.toUpperCase() });
    if (coupons.length === 0) return res.status(404).json({ message: 'Mã giảm giá không tồn tại' });

    const coupon = coupons[0];
    if (!coupon.isActive) return res.status(400).json({ message: 'Mã giảm giá đã bị vô hiệu hóa' });
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(400).json({ message: 'Mã giảm giá đã hết hạn' });
    }
    if (coupon.maxUses > 0 && (coupon.usedCount || 0) >= coupon.maxUses) {
      return res.status(400).json({ message: 'Mã giảm giá đã đạt giới hạn sử dụng' });
    }
    if (coupon.minOrder > 0 && Number(orderTotal) < coupon.minOrder) {
      return res.status(400).json({ message: `Đơn hàng tối thiểu ${coupon.minOrder.toLocaleString('vi-VN')}đ để áp dụng mã này` });
    }

    const discountAmount = coupon.type === 'percent'
      ? Math.round(Number(orderTotal) * coupon.value / 100)
      : coupon.value;

    res.json({ ...coupon, discountAmount });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

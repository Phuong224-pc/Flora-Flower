const db = require('../db');

function genOrderCode() {
  return 'FF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

// POST /api/orders — đặt hàng
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items, recipient, deliveryType, deliveryDate, deliverySlot,
      cardMessage, shopNote, paymentMethod, couponCode,
      subtotal, shippingFee, discount, total
    } = req.body;

    if (!items || items.length === 0) return res.status(400).json({ message: 'Đơn hàng không có sản phẩm' });

    // Validate coupon if provided
    let couponId = null;
    if (couponCode) {
      const coupons = await db.Coupons.find({ code: couponCode.toUpperCase() });
      if (coupons.length > 0 && coupons[0].isActive) {
        couponId = coupons[0].id;
        // Increment usedCount
        await db.Coupons.updateById(couponId, { usedCount: (coupons[0].usedCount || 0) + 1 });
      }
    }

    const order = await db.Orders.create({
      userId,
      orderCode: genOrderCode(),
      items,
      recipient,
      deliveryType: deliveryType || 'delivery',
      deliveryDate,
      deliverySlot,
      cardMessage: cardMessage || '',
      shopNote: shopNote || '',
      paymentMethod: paymentMethod || 'cod',
      couponCode: couponCode || '',
      couponId,
      subtotal: Number(subtotal) || 0,
      shippingFee: Number(shippingFee) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      status: 'pending',
      paymentStatus: 'unpaid',
    });

    // Update soldCount for each product
    for (const item of items) {
      try {
        const products = await db.Products.find({});
        const product = products.find(p => p.id === item.productId);
        if (product) {
          await db.Products.updateById(product.id, { soldCount: (product.soldCount || 0) + item.quantity });
        }
      } catch {}
    }

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tạo đơn hàng', error: error.message });
  }
};

// GET /api/orders/my — danh sách đơn của khách
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await db.Orders.find({ userId: req.user.id });
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await db.Orders.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    // Customer can only view their own order; admin can view all
    if (req.user.role !== 'admin' && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền xem đơn hàng này' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// PATCH /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await db.Orders.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Không có quyền hủy đơn này' });
    }
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Không thể hủy đơn hàng đang trong quá trình xử lý' });
    }
    const updated = await db.Orders.updateById(req.params.id, { status: 'cancelled' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /api/orders/track?code=XXX&phone=0901234567  — tra cứu công khai, không cần đăng nhập
exports.trackOrder = async (req, res) => {
  try {
    const { code, phone } = req.query;
    if (!code || code.trim().length < 4) {
      return res.status(400).json({ message: 'Vui lòng nhập mã đơn hàng hợp lệ (ít nhất 4 ký tự)' });
    }

    const allOrders = await db.Orders.find({});
    const q = code.trim().toUpperCase();

    // Match by orderCode (exact) or last 8 chars of id
    const order = allOrders.find(o => {
      const codeMatch = o.orderCode?.toUpperCase() === q || o.id?.slice(-8).toUpperCase() === q || o.id?.toUpperCase() === q;
      if (!codeMatch) return false;
      // If phone provided, validate
      if (phone && phone.trim()) {
        return o.recipient?.phone?.replace(/\D/g, '') === phone.trim().replace(/\D/g, '');
      }
      return true;
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng. Kiểm tra lại mã đơn và số điện thoại người nhận.' });
    }

    // Return safe public data (no user personal data)
    const safeOrder = {
      id:           order.id,
      orderCode:    order.orderCode,
      status:       order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      createdAt:    order.createdAt,
      updatedAt:    order.updatedAt,
      deliveryDate: order.deliveryDate,
      deliverySlot: order.deliverySlot,
      deliveryType: order.deliveryType,
      recipient: {
        name:    order.recipient?.name,
        phone:   order.recipient?.phone ? order.recipient.phone.slice(0, -3) + '***' : '',
        address: order.recipient?.address,
      },
      items: (order.items || []).map(it => ({
        name:        it.name,
        variantSize: it.variantSize,
        quantity:    it.quantity,
        price:       it.price,
      })),
      subtotal:    order.subtotal,
      shippingFee: order.shippingFee,
      discount:    order.discount,
      total:       order.total,
    };

    res.json(safeOrder);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


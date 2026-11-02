const db = require('../db');

// ─── DASHBOARD ─────────────────────────────────────────────────────────────

exports.getDashboard = async (req, res) => {
  try {
    const range = parseInt(req.query.range) || 30;
    const since = new Date(Date.now() - range * 24 * 60 * 60 * 1000);

    const [allOrders, allProducts, allUsers] = await Promise.all([
      db.Orders.find({}),
      db.Products.find({}),
      db.Users.find({}),
    ]);

    const recentOrders = allOrders.filter(o => new Date(o.createdAt) >= since);

    // Stats
    const stats = {
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      confirmedOrders: allOrders.filter(o => o.status === 'confirmed').length,
      preparingOrders: allOrders.filter(o => o.status === 'preparing').length,
      deliveringOrders: allOrders.filter(o => o.status === 'delivering').length,
      completedOrders: allOrders.filter(o => o.status === 'completed').length,
      cancelledOrders: allOrders.filter(o => o.status === 'cancelled').length,
      totalProducts: allProducts.length,
      activeProducts: allProducts.filter(p => p.status !== 'inactive').length,
      totalCustomers: allUsers.filter(u => u.role !== 'admin').length,
      totalRevenue: allOrders.filter(o => o.status === 'completed').reduce((s, o) => s + (o.total || 0), 0),
      paidRevenue: allOrders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.total || 0), 0),
      ordersByStatus: {},
    };

    // Revenue chart — group by date
    const revenueMap = {};
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
      revenueMap[key] = 0;
    }
    for (const o of allOrders) {
      if (o.paymentStatus === 'paid' && new Date(o.createdAt) >= since) {
        const key = new Date(o.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' });
        if (key in revenueMap) revenueMap[key] += o.total || 0;
      }
    }
    const revenueChart = Object.entries(revenueMap).map(([date, revenue]) => ({ date, revenue }));

    // Top products
    const soldMap = {};
    for (const o of allOrders) {
      if (o.status !== 'cancelled') {
        for (const item of (o.items || [])) {
          if (!soldMap[item.name]) soldMap[item.name] = 0;
          soldMap[item.name] += item.quantity || 1;
        }
      }
    }
    const topProducts = Object.entries(soldMap)
      .map(([name, sold]) => ({ name, sold }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);

    res.json({ stats, revenueChart, topProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ─── ORDERS ────────────────────────────────────────────────────────────────

exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;
    let orders = await db.Orders.find({});
    if (status) orders = orders.filter(o => o.status === status);
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'];
    if (!VALID.includes(status)) return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    const updated = await db.Orders.updateById(req.params.id, { status });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.updateOrderPayment = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const VALID = ['unpaid', 'paid', 'refunded'];
    if (!VALID.includes(paymentStatus)) return res.status(400).json({ message: 'Trạng thái thanh toán không hợp lệ' });
    const updated = await db.Orders.updateById(req.params.id, { paymentStatus });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// ─── PRODUCTS ──────────────────────────────────────────────────────────────

exports.getAllProducts = async (req, res) => {
  try {
    const { q, limit = 100, page = 1 } = req.query;
    let products = await db.Products.find({});
    if (q) {
      const ql = q.toLowerCase();
      products = products.filter(p => p.name?.toLowerCase().includes(ql));
    }
    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const total = products.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = products.slice(start, start + parseInt(limit));
    res.json({ data: paginated, total });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = req.body;
    // Process imagesText if provided
    if (data.imagesText) {
      data.images = data.imagesText.split('\n').map(s => s.trim()).filter(Boolean);
      delete data.imagesText;
    }
    // Auto-generate slug if missing (handle Vietnamese chars)
    if (!data.slug) {
      data.slug = data.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // remove accents
        .replace(/đ/g, 'd')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        + '-' + Date.now();
    }
    // Ensure variants have SKU
    if (data.variants) {
      data.variants = data.variants.map((v, i) => ({
        ...v,
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        sku: v.sku || `${data.slug}-${i + 1}`.toUpperCase(),
      }));
    }
    // Auto-set basePrice from first variant if missing
    if (!data.basePrice && data.variants?.length > 0) {
      data.basePrice = data.variants[0].price;
    }
    data.soldCount = 0;
    data.rating = 0;
    data.reviewCount = 0;
    const product = await db.Products.create(data);
    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tạo sản phẩm', error: error.message });
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const data = req.body;
    if (data.imagesText) {
      data.images = data.imagesText.split('\n').map(s => s.trim()).filter(Boolean);
      delete data.imagesText;
    }
    if (data.variants) {
      data.variants = data.variants.map((v, i) => ({
        ...v,
        price: Number(v.price) || 0,
        stock: Number(v.stock) || 0,
        sku: v.sku || `${data.slug || 'product'}-${i + 1}`.toUpperCase(),
      }));
    }
    const updated = await db.Products.updateById(req.params.id, data);
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi cập nhật', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const ok = await db.Products.deleteById(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json({ message: 'Đã xóa sản phẩm' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa sản phẩm', error: error.message });
  }
};

// ─── CUSTOMERS ─────────────────────────────────────────────────────────────

exports.getAllCustomers = async (req, res) => {
  try {
    const users = await db.Users.find({});
    const orders = await db.Orders.find({});

    const orderCountMap = {};
    for (const o of orders) {
      if (!orderCountMap[o.userId]) orderCountMap[o.userId] = 0;
      orderCountMap[o.userId]++;
    }

    // Chỉ trả về tài khoản khách hàng (loại bỏ admin)
    const safeUsers = users
      .filter(u => u.role !== 'admin')
      .map(u => {
        const { password: _, ...safe } = u;
        return { ...safe, orderCount: orderCountMap[u.id] || 0 };
      });

    safeUsers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// GET /admin/customers/:id — chi tiết khách hàng + toàn bộ đơn hàng
exports.getCustomerDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const users = await db.Users.find({});
    const user = users.find(u => u.id === id || u._id?.toString() === id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });

    // Tài khoản admin không hiển thị qua trang hồ sơ khách hàng
    if (user.role === 'admin') {
      return res.status(403).json({
        message: 'Đây là tài khoản quản trị viên, không phải hồ sơ khách hàng. Xem thông tin trong phần quản lý tài khoản quản trị.',
        isAdmin: true,
      });
    }

    // Lấy tất cả đơn của user này — liên kết bằng userId thực tế
    const allOrders = await db.Orders.find({});
    const orders = allOrders
      .filter(o => o.userId === user.id || o.userId === id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Thống kê
    const stats = {
      totalOrders: orders.length,
      processingOrders: orders.filter(o => ['pending','confirmed','preparing','ready','delivering'].includes(o.status)).length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      // Tổng sản phẩm (số lượng) từ đơn hoàn tất
      totalItemsCompleted: orders
        .filter(o => o.status === 'completed')
        .reduce((s, o) => s + (o.items || []).reduce((si, i) => si + (i.quantity || 1), 0), 0),
      // Tổng tiền thực thu: đơn hoàn tất + paymentStatus = paid (loại refunded)
      totalRevenue: orders
        .filter(o => o.status === 'completed' && o.paymentStatus === 'paid')
        .reduce((s, o) => s + (o.total || 0), 0),
      lastOrderAt: orders[0]?.createdAt || null,
    };

    // Trả về user (không có password) + đơn hàng + thống kê
    const { password: _, ...safeUser } = user;
    res.json({ customer: safeUser, orders, stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};


// ─── COUPONS ───────────────────────────────────────────────────────────────

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await db.Coupons.find({});
    coupons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrder, maxUses, expiresAt } = req.body;
    if (!code || !type || !value) return res.status(400).json({ message: 'Thiếu thông tin mã giảm giá' });

    const existing = await db.Coupons.find({ code: code.toUpperCase() });
    if (existing.length > 0) return res.status(400).json({ message: 'Mã giảm giá đã tồn tại' });

    const coupon = await db.Coupons.create({
      code: code.toUpperCase(),
      type,
      value: Number(value),
      minOrder: Number(minOrder) || 0,
      maxUses: Number(maxUses) || 0,
      expiresAt: expiresAt || null,
      isActive: true,
      usedCount: 0,
    });
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo mã', error: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const ok = await db.Coupons.deleteById(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy mã giảm giá' });
    res.json({ message: 'Đã xóa mã giảm giá' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xóa mã', error: error.message });
  }
};

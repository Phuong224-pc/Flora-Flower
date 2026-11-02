const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfloraflower2024';

exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
  }
  next();
};

// Chặn admin dùng các API mua hàng — role được lấy từ token đã xác thực, không tin frontend
exports.requireCustomer = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return res.status(403).json({
      message: 'Tài khoản quản trị chỉ dùng để quản lý. Vui lòng sử dụng tài khoản khách hàng để mua hoa.',
      code: 'ADMIN_CANNOT_SHOP',
    });
  }
  next();
};

exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {}
  }
  next();
};


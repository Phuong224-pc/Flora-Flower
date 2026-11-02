const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET || 'supersecretfloraflower', (err, user) => {
            if (err) return res.status(403).json({ message: 'Token không hợp lệ' });
            req.user = user;
            next();
        });
    } else {
        res.status(401).json({ message: 'Không tìm thấy token xác thực' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Yêu cầu quyền quản trị viên' });
    }
};

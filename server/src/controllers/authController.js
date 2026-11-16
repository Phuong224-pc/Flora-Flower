const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfloraflower2024';

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validate Họ và tên
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập họ và tên' });
    }
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      return res.status(400).json({ message: 'Họ và tên phải có ít nhất 2 ký tự' });
    }
    if (trimmedName.length > 50) {
      return res.status(400).json({ message: 'Họ và tên không được vượt quá 50 ký tự' });
    }

    // Validate Email
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập email' });
    }
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: 'Email không đúng định dạng (VD: example@domain.com)' });
    }

    // Validate Số điện thoại
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      return res.status(400).json({ message: 'Vui lòng nhập số điện thoại' });
    }
    const cleanPhone = phone.trim();
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ message: 'Số điện thoại phải gồm 10 chữ số hợp lệ (VD: 0901234567)' });
    }

    // Validate Mật khẩu
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Vui lòng nhập mật khẩu' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    }
    if (password.length > 32) {
      return res.status(400).json({ message: 'Mật khẩu tối đa 32 ký tự' });
    }
    if (/\s/.test(password)) {
      return res.status(400).json({ message: 'Mật khẩu không được chứa khoảng trắng' });
    }

    // Kiểm tra trùng email
    const allUsers = await db.Users.find({});
    const emailExists = allUsers.some(u => u.email?.toLowerCase() === cleanEmail);
    if (emailExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng, vui lòng chọn email khác' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.Users.create({
      name: trimmedName,
      email: cleanEmail,
      password: hashedPassword,
      phone: cleanPhone,
      role: 'customer',
      address: ''
    });
    const userId = newUser.id || newUser._id?.toString();

    const token = jwt.sign({ id: userId, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: userId, name: trimmedName, email: cleanEmail, phone: cleanPhone, role: 'customer' }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });

    const users = await db.Users.find({ email });
    if (users.length === 0) return res.status(400).json({ message: 'Email không tồn tại' });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Mật khẩu không đúng' });

    const userId = user.id || user._id?.toString();
    const token = jwt.sign({ id: userId, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: userId, name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await db.Users.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const updated = await db.Users.updateById(req.user.id, { name, phone, address });
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy tài khoản' });
    const { password: _, ...safeUser } = updated;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

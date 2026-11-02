const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretfloraflower2024';

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Thiếu thông tin đăng ký' });

    const existingUsers = await db.Users.find({ email });
    if (existingUsers.length > 0) return res.status(400).json({ message: 'Email đã được sử dụng' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.Users.create({ name, email, password: hashedPassword, phone: phone || '', role: 'customer', address: '' });
    const userId = newUser.id || newUser._id?.toString();

    const token = jwt.sign({ id: userId, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: userId, name, email, phone: phone || '', role: 'customer' } });
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

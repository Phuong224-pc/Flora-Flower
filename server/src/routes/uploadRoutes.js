const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, requireAdmin } = require('../middlewares/auth');

// Đảm bảo thư mục uploads tồn tại
const UPLOAD_DIR = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Cấu hình multer - lưu file vào uploads/products/
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `product-${Date.now()}-${Math.round(Math.random() * 1000)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/upload/image  — upload 1 ảnh
router.post('/image', authenticate, requireAdmin, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Không có file nào được upload' });

  // Trả về URL công khai
  const url = `/uploads/products/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

// POST /api/upload/images — upload nhiều ảnh cùng lúc (tối đa 10)
router.post('/images', authenticate, requireAdmin, upload.array('images', 10), (req, res) => {
  if (!req.files?.length) return res.status(400).json({ message: 'Không có file nào được upload' });

  const urls = req.files.map(f => `/uploads/products/${f.filename}`);
  res.json({ urls });
});

module.exports = router;

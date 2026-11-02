const fs = require('fs');
const path = require('path');

const SETTINGS_FILE = path.join(__dirname, '../../data/settings.json');

// Default settings
const DEFAULT_SETTINGS = {
  shop: {
    name: 'Flora Flower',
    tagline: 'Hoa tươi cao cấp TP.HCM',
    address: '123 Đường Hoa Hồng, Q.1, TP.HCM',
    phone: '0909 123 456',
    email: 'hello@floraflower.vn',
    openHours: '08:00 – 21:00 (T2–CN)',
    facebook: 'https://facebook.com/floraflower',
    instagram: 'https://instagram.com/floraflower',
    logo: '',
  },
  shipping: {
    fee: 30000,
    freeFrom: 500000,
    areas: ['TP. Hồ Chí Minh'],
  },
  bank: {
    bankCode: 'VCB',          // mã ngân hàng VietQR
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'FLORA FLOWER',
    branch: 'CN TP. HCM',
    transferNote: 'FLORA {ORDER_ID}',  // {ORDER_ID} sẽ được thay thế
  },
  order: {
    minAmount: 0,
    confirmTimeout: 30,   // phút
  },
};

function readSettings() {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
      return DEFAULT_SETTINGS;
    }
    const raw = fs.readFileSync(SETTINGS_FILE, 'utf-8');
    // Deep merge with defaults to ensure new keys exist
    const saved = JSON.parse(raw);
    return deepMerge(DEFAULT_SETTINGS, saved);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(data) {
  fs.mkdirSync(path.dirname(SETTINGS_FILE), { recursive: true });
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(data, null, 2));
}

function deepMerge(target, source) {
  const out = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      out[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      out[key] = source[key];
    }
  }
  return out;
}

// GET /api/settings/public — no auth
exports.getPublic = (req, res) => {
  const s = readSettings();
  // Only expose safe public info
  res.json({
    shop: s.shop,
    shipping: s.shipping,
    bank: {
      bankCode: s.bank.bankCode,
      bankName: s.bank.bankName,
      accountNumber: s.bank.accountNumber,
      accountName: s.bank.accountName,
      transferNote: s.bank.transferNote,
    },
  });
};

// GET /api/settings — admin
exports.getAll = (req, res) => {
  res.json(readSettings());
};

// PUT /api/settings — admin
exports.update = (req, res) => {
  const current = readSettings();
  const updated = deepMerge(current, req.body);
  writeSettings(updated);
  res.json(updated);
};

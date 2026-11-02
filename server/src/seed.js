/**
 * Seed script: tạo dữ liệu mẫu cho FLORA FLOWER
 * Chạy: node src/seed.js
 */
const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);

require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./db');

// Ảnh Unsplash đã xác thực — dùng photo ID cố định để tránh lỗi
const FLOWER_IMAGES = {
  rose: [
    'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800&h=600&fit=crop&auto=format',
  ],
  sunflower: [
    'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&h=600&fit=crop&auto=format',
  ],
  mixed: [
    'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format',
  ],
  pink: [
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1444930694458-01babf71ab65?w=800&h=600&fit=crop&auto=format',
  ],
  white: [
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&h=600&fit=crop&auto=format',
  ],
  tulip: [
    'https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&h=600&fit=crop&auto=format',
  ],
  orchid: [
    'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&h=600&fit=crop&auto=format',
  ],
  yellow_rose: [
    'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1569173112611-52a7cd38bea9?w=800&h=600&fit=crop&auto=format',
  ],
  preserved: [
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&h=600&fit=crop&auto=format',
  ],
  graduation: [
    'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1562281304-d6a9a9f5b44e?w=800&h=600&fit=crop&auto=format',
  ],
};

const products = [
  {
    name: 'Bó hoa hồng đỏ tình yêu',
    slug: 'bo-hoa-hong-do-tinh-yeu',
    sku: 'ROSE-RED',
    description: 'Bó hoa hồng đỏ tươi thắm, biểu tượng của tình yêu nồng nàn. Được chọn lọc từ những bông hồng nhập khẩu chất lượng cao, mỗi bông đều nở rộ và thơm ngát.',
    presentation: 'bó',
    occasions: ['Tình yêu', 'Sinh nhật', 'Chúc mừng'],
    flowerTypes: ['Hồng'],
    color: 'Đỏ',
    images: FLOWER_IMAGES.rose,
    isFeatured: true,
    status: 'active',
    soldCount: 128,
    rating: 4.8,
    reviewCount: 32,
    basePrice: 350000,
    variants: [
      { size: 'S', price: 250000, stock: 20, sku: 'ROSE-RED-S' },
      { size: 'M', price: 350000, stock: 15, sku: 'ROSE-RED-M' },
      { size: 'L', price: 500000, stock: 10, sku: 'ROSE-RED-L' },
    ],
    careInstructions: 'Cắt bớt gốc 1-2cm, đặt trong bình nước sạch. Thay nước mỗi 1-2 ngày, tránh ánh nắng trực tiếp.',
  },
  {
    name: 'Giỏ hoa hướng dương rực rỡ',
    slug: 'gio-hoa-huong-duong-ruc-ro',
    sku: 'SUN-BASKET',
    description: 'Giỏ hoa hướng dương tươi sáng, mang năng lượng tích cực và niềm vui. Thiết kế giỏ mây tự nhiên sang trọng, phù hợp làm quà tặng khai trương, sinh nhật.',
    presentation: 'giỏ',
    occasions: ['Sinh nhật', 'Khai trương', 'Chúc mừng'],
    flowerTypes: ['Hướng dương'],
    color: 'Vàng',
    images: FLOWER_IMAGES.sunflower,
    isFeatured: true,
    status: 'active',
    soldCount: 95,
    rating: 4.7,
    reviewCount: 28,
    basePrice: 320000,
    variants: [
      { size: 'S', price: 320000, stock: 18, sku: 'SUN-BASKET-S' },
      { size: 'L', price: 480000, stock: 10, sku: 'SUN-BASKET-L' },
    ],
    careInstructions: 'Cắt bớt gốc hoa, đặt trong bình nước. Thay nước mỗi ngày để hoa tươi lâu hơn.',
  },
  {
    name: 'Hộp hoa hồng pastel sinh nhật',
    slug: 'hop-hoa-hong-pastel-sinh-nhat',
    sku: 'PASTEL-BOX',
    description: 'Hộp hoa hồng pastel nhẹ nhàng, ngọt ngào. Thiết kế hộp kraft hiện đại, bên trong là những bông hồng pastel hồng phấn, lavender và trắng kem xen kẽ cùng hoa bi trắng.',
    presentation: 'hộp',
    occasions: ['Sinh nhật', 'Tình yêu', 'Cảm ơn'],
    flowerTypes: ['Hồng'],
    color: 'Pastel',
    images: FLOWER_IMAGES.pink,
    isFeatured: true,
    status: 'active',
    soldCount: 156,
    rating: 4.9,
    reviewCount: 45,
    basePrice: 280000,
    variants: [
      { size: 'S', price: 280000, stock: 25, sku: 'PASTEL-BOX-S' },
      { size: 'M', price: 420000, stock: 18, sku: 'PASTEL-BOX-M' },
      { size: 'L', price: 620000, stock: 8, sku: 'PASTEL-BOX-L' },
    ],
    careInstructions: 'Giữ hoa trong hộp, đặt nơi thoáng mát. Tránh ánh nắng trực tiếp.',
  },
  {
    name: 'Kệ hoa khai trương thịnh vượng',
    slug: 'ke-hoa-khai-truong-thinh-vuong',
    sku: 'STAND-OPEN',
    description: 'Kệ hoa khai trương hoành tráng, sang trọng. Kết hợp hoa lay ơn, hoa cúc, hồng và hướng dương trên khung kệ chắc chắn. Mang ý nghĩa chúc mừng phát đạt, thịnh vượng.',
    presentation: 'kệ',
    occasions: ['Khai trương', 'Chúc mừng'],
    flowerTypes: ['Hoa phối', 'Lay ơn', 'Cúc'],
    color: 'Nhiều màu',
    images: FLOWER_IMAGES.mixed,
    isFeatured: true,
    status: 'active',
    soldCount: 72,
    rating: 4.8,
    reviewCount: 19,
    basePrice: 650000,
    variants: [
      { size: 'S', price: 650000, stock: 10, sku: 'STAND-OPEN-S' },
      { size: 'L', price: 1200000, stock: 6, sku: 'STAND-OPEN-L' },
    ],
    careInstructions: 'Đặt nơi thoáng, tránh gió mạnh. Phun sương nhẹ mỗi sáng để giữ độ tươi.',
  },
  {
    name: 'Bó hoa cưới trắng thanh khiết',
    slug: 'bo-hoa-cuoi-trang-thanh-khiet',
    sku: 'WEDDING-BOUQ',
    description: 'Bó hoa cưới cầm tay thiết kế tinh tế với hoa hồng trắng, hoa lan trắng và hoa phụ xanh nhẹ. Tạo nên vẻ đẹp thuần khiết, lãng mạn cho ngày trọng đại.',
    presentation: 'bó',
    occasions: ['Cưới'],
    flowerTypes: ['Hồng', 'Lan'],
    color: 'Trắng',
    images: FLOWER_IMAGES.white,
    isFeatured: true,
    status: 'active',
    soldCount: 43,
    rating: 5.0,
    reviewCount: 15,
    basePrice: 850000,
    variants: [
      { size: 'S', price: 850000, stock: 8, sku: 'WEDDING-HAND' },
      { size: 'L', price: 1500000, stock: 5, sku: 'WEDDING-SET' },
    ],
    careInstructions: 'Bảo quản trong tủ mát hoặc phun sương nhẹ. Dùng trong ngày để đảm bảo độ tươi tốt nhất.',
  },
  {
    name: 'Bình hoa tulip đa sắc',
    slug: 'binh-hoa-tulip-da-sac',
    sku: 'TULIP-VASE',
    description: 'Bình hoa tulip đa màu sắc tươi tắn, mang đến không gian sống thêm phần rực rỡ. Gồm nhiều màu tulip tím, hồng, vàng và trắng, cắm trong bình thủy tinh sang trọng.',
    presentation: 'bình',
    occasions: ['Sinh nhật', 'Chúc mừng', 'Cảm ơn'],
    flowerTypes: ['Tulip'],
    color: 'Nhiều màu',
    images: FLOWER_IMAGES.tulip,
    isFeatured: false,
    status: 'active',
    soldCount: 61,
    rating: 4.6,
    reviewCount: 22,
    basePrice: 380000,
    variants: [
      { size: 'S', price: 380000, stock: 12, sku: 'TULIP-VASE-S' },
      { size: 'L', price: 580000, stock: 8, sku: 'TULIP-VASE-L' },
    ],
    careInstructions: 'Thay nước mỗi 2 ngày. Cắt gốc chéo 45 độ. Đặt nơi có ánh sáng tự nhiên nhưng không có nắng gắt.',
  },
  {
    name: 'Bó hoa chia buồn cúc trắng',
    slug: 'bo-hoa-chia-buon-cuc-trang',
    sku: 'SYMPATHY',
    description: 'Bó hoa chia buồn cúc trắng và hoa ly trắng trang nhã, thể hiện sự chia sẻ chân thành. Thiết kế giản dị mà thanh lịch, gói giấy kraft trắng tinh tế.',
    presentation: 'bó',
    occasions: ['Chia buồn'],
    flowerTypes: ['Cúc', 'Ly'],
    color: 'Trắng',
    images: FLOWER_IMAGES.white,
    isFeatured: false,
    status: 'active',
    soldCount: 38,
    rating: 4.7,
    reviewCount: 12,
    basePrice: 280000,
    variants: [
      { size: 'S', price: 280000, stock: 15, sku: 'SYMPATHY-S' },
      { size: 'L', price: 450000, stock: 10, sku: 'SYMPATHY-L' },
    ],
    careInstructions: 'Cắt bớt gốc, đặt trong bình nước sạch ở nơi thoáng mát.',
  },
  {
    name: 'Hộp hoa cảm ơn thầy cô',
    slug: 'hop-hoa-cam-on-thay-co',
    sku: 'THANKYOU-BOX',
    description: 'Hộp hoa tươi sang trọng dành tặng thầy cô với thông điệp tri ân. Kết hợp hoa cúc vàng, hoa hồng và cẩm chướng đầy ý nghĩa, đựng trong hộp giấy cao cấp có nắp trong suốt.',
    presentation: 'hộp',
    occasions: ['Cảm ơn', 'Sinh nhật'],
    flowerTypes: ['Cúc', 'Hồng', 'Cẩm chướng'],
    color: 'Nhiều màu',
    images: FLOWER_IMAGES.mixed,
    isFeatured: false,
    status: 'active',
    soldCount: 84,
    rating: 4.8,
    reviewCount: 30,
    basePrice: 250000,
    variants: [
      { size: 'S', price: 250000, stock: 20, sku: 'THANKYOU-S' },
      { size: 'M', price: 380000, stock: 15, sku: 'THANKYOU-M' },
      { size: 'L', price: 550000, stock: 8, sku: 'THANKYOU-L' },
    ],
    careInstructions: 'Tách hoa ra khỏi hộp, cắm vào bình nước để hoa tươi lâu hơn.',
  },
  {
    name: 'Bó hoa tốt nghiệp rực rỡ',
    slug: 'bo-hoa-tot-nghiep-ruc-ro',
    sku: 'GRAD-BOUQ',
    description: 'Bó hoa tốt nghiệp sắc màu rực rỡ, chúc mừng thành tích học tập xuất sắc. Kết hợp hoa hướng dương, hồng vàng, cúc và hoa phụ đầy màu sắc.',
    presentation: 'bó',
    occasions: ['Chúc mừng', 'Cảm ơn'],
    flowerTypes: ['Hướng dương', 'Hồng', 'Cúc'],
    color: 'Nhiều màu',
    images: FLOWER_IMAGES.mixed,
    isFeatured: false,
    status: 'active',
    soldCount: 55,
    rating: 4.7,
    reviewCount: 18,
    basePrice: 290000,
    variants: [
      { size: 'S', price: 290000, stock: 20, sku: 'GRAD-S' },
      { size: 'L', price: 450000, stock: 12, sku: 'GRAD-L' },
    ],
    careInstructions: 'Cắt gốc, cắm vào bình nước. Thay nước mỗi ngày.',
  },
  {
    name: 'Giỏ hoa lan hồ điệp sinh nhật',
    slug: 'gio-hoa-lan-ho-diep-sinh-nhat',
    sku: 'ORCHID-BASKET',
    description: 'Giỏ hoa lan hồ điệp sang trọng, biểu tượng của vẻ đẹp cao quý. Thích hợp làm quà sinh nhật, tặng người thân yêu hoặc đối tác kinh doanh.',
    presentation: 'giỏ',
    occasions: ['Sinh nhật', 'Khai trương'],
    flowerTypes: ['Lan'],
    color: 'Hồng',
    images: FLOWER_IMAGES.pink,
    isFeatured: true,
    status: 'active',
    soldCount: 47,
    rating: 4.9,
    reviewCount: 16,
    basePrice: 680000,
    variants: [
      { size: 'S', price: 680000, stock: 8, sku: 'ORCHID-BASKET-S' },
      { size: 'L', price: 1100000, stock: 5, sku: 'ORCHID-BASKET-L' },
    ],
    careInstructions: 'Tưới nước 1 lần/tuần. Đặt nơi có ánh sáng gián tiếp. Nhiệt độ phòng 18-28 độ C.',
  },
  {
    name: 'Bó hoa hồng vàng chúc mừng',
    slug: 'bo-hoa-hong-vang-chuc-mung',
    sku: 'ROSE-GOLD',
    description: 'Bó hoa hồng vàng rực rỡ mang ý nghĩa chúc mừng thành công và thịnh vượng. Màu vàng tươi sáng là biểu tượng của niềm vui và hy vọng.',
    presentation: 'bó',
    occasions: ['Chúc mừng', 'Sinh nhật', 'Khai trương'],
    flowerTypes: ['Hồng'],
    color: 'Vàng',
    images: FLOWER_IMAGES.mixed,
    isFeatured: false,
    status: 'active',
    soldCount: 73,
    rating: 4.6,
    reviewCount: 24,
    basePrice: 280000,
    variants: [
      { size: 'S', price: 280000, stock: 18, sku: 'ROSE-GOLD-S' },
      { size: 'L', price: 520000, stock: 10, sku: 'ROSE-GOLD-L' },
    ],
    careInstructions: 'Cắt gốc chéo, cắm ngay vào bình nước mát. Tránh để gần trái cây chín.',
  },
  {
    name: 'Hộp hoa hồng sáp vĩnh cửu',
    slug: 'hop-hoa-hong-sap-vinh-cuu',
    sku: 'ETERNAL-ROSE',
    description: 'Hộp hoa hồng sáp nhập khẩu bền đẹp mãi mãi, không cần chăm sóc. Biểu tượng của tình yêu vĩnh cửu, là món quà độc đáo cho những dịp đặc biệt.',
    presentation: 'hộp',
    occasions: ['Tình yêu', 'Sinh nhật', 'Cảm ơn'],
    flowerTypes: ['Hồng'],
    color: 'Đỏ',
    images: FLOWER_IMAGES.rose,
    isFeatured: false,
    status: 'active',
    soldCount: 89,
    rating: 4.8,
    reviewCount: 37,
    basePrice: 450000,
    variants: [
      { size: 'S', price: 450000, stock: 15, sku: 'ETERNAL-S' },
      { size: 'M', price: 750000, stock: 10, sku: 'ETERNAL-M' },
      { size: 'L', price: 1200000, stock: 5, sku: 'ETERNAL-L' },
    ],
    careInstructions: 'Không cần tưới nước. Tránh ánh nắng trực tiếp và nơi ẩm ướt. Bảo quản lâu dài trong điều kiện nhiệt độ phòng.',
  },
];


const users = [
  {
    name: 'Admin Flora',
    email: 'admin@floraflower.vn',
    password: 'admin123',
    phone: '0901000001',
    role: 'admin',
    address: '123 Đường Hoa Hồng, Q1, TP.HCM',
  },
  {
    name: 'Nguyễn Thị Hoa',
    email: 'customer@example.com',
    password: 'customer123',
    phone: '0901234567',
    role: 'customer',
    address: '456 Đường Cúc Vạn Thọ, Q3, TP.HCM',
  },
  {
    name: 'Trần Văn Bình',
    email: 'binh.tran@example.com',
    password: 'password123',
    phone: '0912345678',
    role: 'customer',
    address: '789 Đường Hướng Dương, Q7, TP.HCM',
  },
];

const coupons = [
  {
    code: 'FLORA10',
    type: 'percent',
    value: 10,
    minOrder: 200000,
    maxUses: 100,
    expiresAt: null,
    isActive: true,
    usedCount: 5,
  },
  {
    code: 'FREESHIP',
    type: 'fixed',
    value: 30000,
    minOrder: 300000,
    maxUses: 50,
    expiresAt: null,
    isActive: true,
    usedCount: 12,
  },
  {
    code: 'BIRTHDAY20',
    type: 'percent',
    value: 20,
    minOrder: 500000,
    maxUses: 30,
    expiresAt: null,
    isActive: true,
    usedCount: 3,
  },
];

const occasions = [
  { label: 'Sinh nhật',  slug: 'sinh-nhat',   icon: '🎂', description: 'Những bó hoa tươi thắm gửi gắm yêu thương trong ngày sinh nhật',  order: 1,  showInMenu: true, status: 'published', content: 'Chào mừng ngày đặc biệt của bạn với những mẫu hoa sinh nhật đẹp nhất' },
  { label: 'Tình yêu',   slug: 'tinh-yeu',    icon: '❤️', description: 'Hoa hồng đỏ thắm, hóa hình hạnh phúc và tình yêu bất diệt',              order: 2,  showInMenu: true, status: 'published', content: 'Thể hiện tình cảm sâu sắc qua những bó hoa tình yêu tinh tế' },
  { label: 'Kỷ niệm',    slug: 'ky-niem',     icon: '💍', description: 'Hoa kỷ niệm — lưu giữ kỏ niệm đẹp bằng những cánh hoa tươi',               order: 3,  showInMenu: true, status: 'published', content: 'Kỷ niệm ngày đặc biệt cùng người thân yêu' },
  { label: 'Khai trương', slug: 'khai-truong', icon: '🏪', description: 'Khai trương thịnh vượng — hưng thịnh phút đạt qua những khủ hoa tươi',    order: 4,  showInMenu: true, status: 'published', content: 'Chúc mừng khai trương thịnh vượng và phút đạt' },
  { label: 'Chúc mừng',  slug: 'chuc-mung',   icon: '🎉', description: 'Gửi lời chúc mừng đặc biệt qua những bó hoa rực rỡ sắc màu',            order: 5,  showInMenu: true, status: 'published', content: 'Hoa chúc mừng cho mọi dịp đặc biệt trong cuộc sống' },
  { label: 'Cảm ơn',     slug: 'cam-on',      icon: '🙏', description: 'Nói lời cảm ơn chân thành qua những bó hoa tính tế và ý nghĩa',          order: 6,  showInMenu: true, status: 'published', content: 'Tri ân thầy cô, người thân và đồng nghiệp qua hoa' },
  { label: 'Hoa cưới',   slug: 'cuoi',        icon: '💐', description: 'Hoa cưới tinh khiết — điểm nhấn tuyệt vời cho ngày trọng đại',          order: 7,  showInMenu: true, status: 'published', content: 'Hoa cưới đẹp từng chi tiết cho ngày cưới đặc biệt' },
  { label: 'Chia buồn',  slug: 'chia-buon',   icon: '🕊️', description: 'Hoa chia buồn — gửi lời thăm hỏi đầy chân tình đến gia quyến',       order: 8,  showInMenu: true, status: 'published', content: 'Chia sẻ nỗi đau cùng tấm lòng chân thành' },
  { label: 'Tốt nghiệp', slug: 'tot-nghiep',  icon: '🎓', description: 'Chung vui cùng tân cử nhân — những bó hoa tươi thắm đặc biệt',            order: 9,  showInMenu: true, status: 'published', content: 'Chúc mừng tốt nghiệp và thành công trên con đường sự nghiệp' },
];

async function seed() {
  await db.connect();
  console.log('🌱 Starting seed...');

  // Seed users
  const existingUsers = await db.Users.find({});
  if (existingUsers.length === 0) {
    for (const u of users) {
      const hashed = await bcrypt.hash(u.password, 10);
      await db.Users.create({ ...u, password: hashed });
      console.log(`  ✓ User: ${u.email}`);
    }
  } else {
    console.log(`  ⏭  Users already exist (${existingUsers.length}), skipping`);
  }

  // Seed products
  const existingProducts = await db.Products.find({});
  if (existingProducts.length === 0) {
    for (const p of products) {
      await db.Products.create(p);
      console.log(`  ✓ Product: ${p.name}`);
    }
  } else {
    console.log(`  ⏭  Products already exist (${existingProducts.length}), skipping`);
  }

  // Seed coupons
  const existingCoupons = await db.Coupons.find({});
  if (existingCoupons.length === 0) {
    for (const c of coupons) {
      await db.Coupons.create(c);
      console.log(`  ✓ Coupon: ${c.code}`);
    }
  } else {
    console.log(`  ⏭  Coupons already exist (${existingCoupons.length}), skipping`);
  }

  // Seed occasions
  const existingOccasions = await db.Occasions.find({});
  const existingSlugs = existingOccasions.map(o => o.slug);
  let addedOccasions = 0;
  for (const o of occasions) {
    if (!existingSlugs.includes(o.slug)) {
      await db.Occasions.create(o);
      console.log(`  ✓ Occasion: ${o.icon} ${o.label}`);
      addedOccasions++;
    } else {
      console.log(`  ⏭  Occasion already exists: ${o.label}`);
    }
  }
  if (addedOccasions === 0) console.log(`  ⏭  All occasions already exist (${existingOccasions.length})`);

  console.log('\n✅ Seed completed!');
  console.log('🔑 Admin: admin@floraflower.vn / admin123');
  console.log('👤 Customer: customer@example.com / customer123');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});

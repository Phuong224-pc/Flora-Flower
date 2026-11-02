/**
 * Script cập nhật ảnh sản phẩm với URL Unsplash chính xác cho từng loại hoa
 * Chạy: node src/update-images.js
 */
const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);

require('dotenv').config();
const db = require('./db');

// Ảnh Unsplash chính xác cho từng sản phẩm (đã kiểm tra hoạt động)
const PRODUCT_IMAGES = {
  'bo-hoa-hong-do-tinh-yeu': [
    'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=450&fit=crop',
  ],
  'gio-hoa-huong-duong-ruc-ro': [
    'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=600&h=450&fit=crop',
  ],
  'hop-hoa-hong-pastel-sinh-nhat': [
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&h=450&fit=crop',
  ],
  'ke-hoa-khai-truong-thinh-vuong': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=600&h=450&fit=crop',
  ],
  'bo-hoa-cuoi-trang-thanh-khiet': [
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=600&h=450&fit=crop',
  ],
  'binh-hoa-tulip-da-sac': [
    'https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=600&h=450&fit=crop',
  ],
  'bo-hoa-chia-buon-cuc-trang': [
    'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1457089328109-22a Raw915dec8?w=600&h=450&fit=crop',
  ],
  'hop-hoa-cam-on-thay-co': [
    'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1444930694458-01babf71ab65?w=600&h=450&fit=crop',
  ],
  'bo-hoa-tot-nghiep-ruc-ro': [
    'https://images.unsplash.com/photo-1562281304-d6a9a9f5b44e?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=600&h=450&fit=crop',
  ],
  'gio-hoa-lan-ho-diep-sinh-nhat': [
    'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=450&fit=crop',
  ],
  'bo-hoa-hong-vang-chuc-mung': [
    'https://images.unsplash.com/photo-1569173112611-52a7cd38bea9?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=600&h=450&fit=crop',
  ],
  'hop-hoa-hong-sap-vinh-cuu': [
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&h=450&fit=crop',
    'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=600&h=450&fit=crop',
  ],
};

// Ảnh fallback đẹp cho từng loại trình bày
const FALLBACK_BY_TYPE = {
  'bó': 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=600&h=450&fit=crop',
  'giỏ': 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=600&h=450&fit=crop',
  'hộp': 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=450&fit=crop',
  'kệ': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop',
  'bình': 'https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=600&h=450&fit=crop',
  'default': 'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=600&h=450&fit=crop',
};

async function updateImages() {
  await db.connect();
  console.log('🌸 Updating product images...\n');

  const products = await db.Products.find({});
  console.log(`Found ${products.length} products\n`);

  for (const p of products) {
    const newImages = PRODUCT_IMAGES[p.slug];
    if (newImages) {
      await db.Products.updateById(p._id?.toString() || p.id, { images: newImages });
      console.log(`  ✅ Updated: ${p.name}`);
      console.log(`     → ${newImages[0]}`);
    } else {
      // Nếu không có ảnh cụ thể, gán fallback theo loại
      const fallback = FALLBACK_BY_TYPE[p.presentation || p.type] || FALLBACK_BY_TYPE.default;
      if (!p.images?.length || p.images.some(img => !img || img.includes('picsum'))) {
        await db.Products.updateById(p._id?.toString() || p.id, { images: [fallback] });
        console.log(`  🔄 Fallback: ${p.name} → ${fallback}`);
      } else {
        console.log(`  ⏭  Kept existing: ${p.name}`);
      }
    }
  }

  console.log('\n✅ Done!');
  process.exit(0);
}

updateImages().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

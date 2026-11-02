/**
 * Cập nhật ảnh hoa cho từng sản phẩm trong MongoDB
 * node src/fix-images.js
 */
const dns = require('dns');
dns.setServers(['1.1.1.1', '1.0.0.1']);
require('dotenv').config();
const db = require('./db');

const IMAGES_BY_SLUG = {
  'bo-hoa-hong-do-tinh-yeu': [
    'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1559563458-527698bf5295?w=800&h=600&fit=crop&auto=format',
  ],
  'gio-hoa-huong-duong-ruc-ro': [
    'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=800&h=600&fit=crop&auto=format',
  ],
  'hop-hoa-hong-pastel-sinh-nhat': [
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1444930694458-01babf71ab65?w=800&h=600&fit=crop&auto=format',
  ],
  'ke-hoa-khai-truong-thinh-vuong': [
    'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&auto=format',
  ],
  'bo-hoa-cuoi-trang-thanh-khiet': [
    'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&h=600&fit=crop&auto=format',
  ],
  'binh-hoa-tulip-da-sac': [
    'https://images.unsplash.com/photo-1490750967868-88df5691cc56?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=800&h=600&fit=crop&auto=format',
  ],
  'bo-hoa-chia-buon-cuc-trang': [
    'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=800&h=600&fit=crop&auto=format',
  ],
  'hop-hoa-cam-on-thay-co': [
    'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800&h=600&fit=crop&auto=format',
  ],
  'bo-hoa-tot-nghiep-ruc-ro': [
    'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1487530811015-780b21f4f0e5?w=800&h=600&fit=crop&auto=format',
  ],
  'gio-hoa-lan-ho-diep-sinh-nhat': [
    'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=800&h=600&fit=crop&auto=format',
  ],
  'bo-hoa-hong-vang-chuc-mung': [
    'https://images.unsplash.com/photo-1548460848-d7b0da0e01e0?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1569173112611-52a7cd38bea9?w=800&h=600&fit=crop&auto=format',
  ],
  'hop-hoa-hong-sap-vinh-cuu': [
    'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&h=600&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=800&h=600&fit=crop&auto=format',
  ],
};

async function run() {
  await db.connect();
  console.log('🌸 Updating product images in MongoDB...\n');

  const products = await db.Products.find({});
  let updated = 0;

  for (const p of products) {
    const id = (p._id || p.id)?.toString();
    const imgs = IMAGES_BY_SLUG[p.slug];
    if (imgs) {
      await db.Products.updateById(id, { images: imgs });
      console.log(`  ✅ ${p.name}`);
      updated++;
    } else {
      console.log(`  ⚠️  No image map for: ${p.slug}`);
    }
  }

  console.log(`\n✅ Updated ${updated}/${products.length} products`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });

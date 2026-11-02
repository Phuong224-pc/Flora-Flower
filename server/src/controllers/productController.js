const db = require('../db');

// Helper: generate order code
function genOrderCode() {
  return 'FF' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase();
}

exports.getProducts = async (req, res) => {
  try {
    const { q, sort, occasion, type, flowerType, inStock, featured, limit = 20, page = 1 } = req.query;
    let products = await db.Products.find({});

    // Filters
    if (q) {
      const ql = q.toLowerCase();
      products = products.filter(p => p.name?.toLowerCase().includes(ql) || p.description?.toLowerCase().includes(ql));
    }
    if (occasion) {
      const occ = occasion.toLowerCase().trim()
      products = products.filter(p => {
        // Check cả occasions (array) và occasion (string hoặc array)
        const arr = [
          ...(Array.isArray(p.occasions) ? p.occasions : []),
          ...(Array.isArray(p.occasion)  ? p.occasion  : (p.occasion ? [p.occasion] : [])),
        ]
        return arr.some(o => o.toLowerCase().trim() === occ)
      })
    }
    if (type) {
      const t = type.toLowerCase().trim()
      products = products.filter(p => {
        // "Bó hoa" matches presentation="bó" or type="Bó hoa"
        const pt = (p.type || '').toLowerCase().trim()
        const pp = (p.presentation || '').toLowerCase().trim()
        return pt === t || pp === t || pt.startsWith(t) || t.startsWith(pt)
      })
    }
    if (flowerType) {
      const ft = flowerType.toLowerCase().trim()
      products = products.filter(p => {
        const arr = [
          ...(Array.isArray(p.flowerTypes) ? p.flowerTypes : []),
          ...(p.flowerType ? [p.flowerType] : []),
        ]
        return arr.some(f => f.toLowerCase().trim() === ft) ||
               (p.type || '').toLowerCase().includes(ft)
      })
    }
    if (inStock === 'true') {
      products = products.filter(p => p.variants?.some(v => v.stock > 0));
    }
    if (featured === 'true') {
      products = products.filter(p => p.isFeatured === true);
    }
    // Only active
    products = products.filter(p => p.status !== 'inactive');

    // Sort
    if (sort === 'newest') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sort === 'bestseller') products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    else if (sort === 'price_asc') products.sort((a, b) => (a.variants?.[0]?.price || 0) - (b.variants?.[0]?.price || 0));
    else if (sort === 'price_desc') products.sort((a, b) => (b.variants?.[0]?.price || 0) - (a.variants?.[0]?.price || 0));
    else products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = products.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginated = products.slice(start, start + parseInt(limit));

    res.json({ data: paginated, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    let products = await db.Products.find({});
    const product = products.find(p => p.slug === slug || p.id === slug);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

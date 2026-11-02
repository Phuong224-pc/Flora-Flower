const db = require('../db');

// GET /api/occasions — public list
exports.getOccasions = async (req, res) => {
  try {
    const { menuOnly } = req.query;
    let occasions = await db.Occasions.find({});
    occasions = occasions.filter(o => o.status === 'published');
    if (menuOnly === 'true') occasions = occasions.filter(o => o.showInMenu);
    occasions.sort((a, b) => (a.order || 999) - (b.order || 999));
    res.json(occasions);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/occasions/:slug
exports.getOccasionBySlug = async (req, res) => {
  try {
    const occasions = await db.Occasions.find({ slug: req.params.slug });
    if (!occasions.length) return res.status(404).json({ message: 'Không tìm thấy dịp tặng hoa' });
    const occ = occasions.find(o => o.status === 'published') || occasions[0];
    res.json(occ);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /api/occasions/:slug/products
exports.getOccasionProducts = async (req, res) => {
  try {
    const { sort = 'newest', page = 1, limit = 12, minPrice, maxPrice } = req.query;

    // Find occasion
    const occasions = await db.Occasions.find({ slug: req.params.slug });
    if (!occasions.length) return res.status(404).json({ message: 'Không tìm thấy dịp' });
    const occ = occasions[0];
    const occasionLabel = occ.label;

    // Get matching products
    let products = await db.Products.find({});
    products = products.filter(p => p.status !== 'inactive');

    // Filter by occasion — check both 'occasion' array and 'occasions' array
    products = products.filter(p => {
      const occArr = p.occasion || p.occasions || [];
      return occArr.some(o =>
        o.toLowerCase().includes(occ.slug.replace(/-/g, ' ')) ||
        o.toLowerCase().includes(occasionLabel.toLowerCase()) ||
        occ.slug.split('-').some(part => o.toLowerCase().includes(part))
      );
    });

    // Price filter
    if (minPrice) products = products.filter(p => (p.variants?.[0]?.price || 0) >= Number(minPrice));
    if (maxPrice) products = products.filter(p => (p.variants?.[0]?.price || 0) <= Number(maxPrice));

    // Sort
    if (sort === 'bestseller') products.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    else if (sort === 'price_asc') products.sort((a, b) => (a.variants?.[0]?.price||0) - (b.variants?.[0]?.price||0));
    else if (sort === 'price_desc') products.sort((a, b) => (b.variants?.[0]?.price||0) - (a.variants?.[0]?.price||0));
    else products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const total = products.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    res.json({ data: products.slice(start, start + parseInt(limit)), total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────

exports.adminGetAll = async (req, res) => {
  try {
    const occasions = await db.Occasions.find({});
    occasions.sort((a, b) => (a.order || 999) - (b.order || 999));
    res.json(occasions);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.adminCreate = async (req, res) => {
  try {
    const { label, slug, description, content, icon, bannerImage,
            showInMenu, order, status, seoTitle, seoDesc } = req.body;

    if (!label || !slug) return res.status(400).json({ message: 'Thiếu tên và slug' });

    // Check slug unique
    const existing = await db.Occasions.find({ slug });
    if (existing.length) return res.status(400).json({ message: 'Slug đã tồn tại' });

    const occ = await db.Occasions.create({
      label, slug,
      description: description || '',
      content: content || '',
      icon: icon || '🌸',
      bannerImage: bannerImage || '',
      showInMenu: showInMenu !== false,
      order: Number(order) || 99,
      status: status || 'draft',
      seoTitle: seoTitle || label,
      seoDesc: seoDesc || description || '',
    });
    res.status(201).json(occ);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.adminUpdate = async (req, res) => {
  try {
    const updated = await db.Occasions.updateById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.adminDelete = async (req, res) => {
  try {
    const ok = await db.Occasions.deleteById(req.params.id);
    if (!ok) return res.status(404).json({ message: 'Không tìm thấy' });
    res.json({ message: 'Đã xóa' });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    size: { type: String, required: true },       // free text: 'S', 'M', 'L', 'Nhỏ', 'Lớn', etc.
    sku: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 }
});

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String },                         // optional at product level
    description: { type: String },
    ingredients: [{ type: String }],
    // presentation/type - accept both field names
    presentation: { type: String },               // 'bó', 'giỏ', 'hộp', 'bình', 'kệ'
    type: { type: String },                        // 'Bó hoa', 'Giỏ hoa', ... (from admin form)
    // flowerTypes/flowerType
    flowerTypes: [{ type: String }],
    flowerType: { type: String },
    // occasions/occasion
    occasions: [{ type: String }],
    occasion: [{ type: String }],
    color: { type: String },
    basePrice: { type: Number },
    originalPrice: { type: Number },              // alias used in some places
    discountPrice: { type: Number },
    images: [{ type: String }],
    variants: [variantSchema],
    careInstructions: { type: String },
    components: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

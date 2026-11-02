const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    productId: { type: String },
    name: { type: String, required: true },
    variantSize: { type: String },
    variant: { size: String, sku: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    image: { type: String }
});

const orderSchema = new mongoose.Schema({
    userId: { type: String },
    orderCode: { type: String, required: true, unique: true },
    items: [orderItemSchema],

    // Thông tin người nhận
    recipient: {
        name: { type: String },
        phone: { type: String },
        address: { type: String }
    },

    // Giao hàng
    deliveryType: { type: String, default: 'delivery' },   // 'delivery' | 'pickup'
    deliveryDate: { type: String },
    deliverySlot: { type: String },

    // Ghi chú
    cardMessage: { type: String, default: '' },
    shopNote: { type: String, default: '' },

    // Thanh toán
    paymentMethod: { type: String, default: 'cod' },       // 'cod' | 'bank' | 'momo'
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },

    // Coupon
    couponCode: { type: String, default: '' },
    couponId: { type: String, default: null },

    // Tiền
    subtotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Trạng thái đơn
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled'],
        default: 'pending'
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');
const LocalDb = require('./localDb');
const MongoDb = require('./mongoDb');

const mode = process.env.DB_MODE || 'local';

const db = {
  connect: async () => {
    if (mode === 'mongo') {
      try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
      } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
      }
    } else {
      console.log('📁 Using Local JSON File Database');
    }
  },
  Products: mode === 'mongo' ? new MongoDb(require('../models/Product')) : new LocalDb('products'),
  Orders:   mode === 'mongo' ? new MongoDb(require('../models/Order'))   : new LocalDb('orders'),
  Users:    mode === 'mongo' ? new MongoDb(require('../models/User'))     : new LocalDb('users'),
  Coupons:  mode === 'mongo' ? new MongoDb(require('../models/Coupon'))   : new LocalDb('coupons'),
  Occasions: mode === 'mongo' ? new MongoDb(require('../models/Occasion')) : new LocalDb('occasions'),
};

module.exports = db;

const mongoose = require('mongoose');

const occasionSchema = new mongoose.Schema({
  label:       { type: String, required: true },
  slug:        { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  content:     { type: String, default: '' },
  icon:        { type: String, default: '🌸' },
  bannerImage: { type: String, default: '' },
  showInMenu:  { type: Boolean, default: true },
  order:       { type: Number, default: 99 },
  status:      { type: String, enum: ['draft','published','archived'], default: 'published' },
  seoTitle:    { type: String, default: '' },
  seoDesc:     { type: String, default: '' },
}, { timestamps: true });

occasionSchema.virtual('id').get(function() { return this._id.toHexString(); });
occasionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Occasion', occasionSchema);

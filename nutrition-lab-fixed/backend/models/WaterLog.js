const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date:    { type: String, required: true },
  amount:  { type: Number, default: 0 },
}, { timestamps: true });

waterLogSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WaterLog', waterLogSchema);

const mongoose = require('mongoose');

const weightLogSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date:    { type: String, required: true },
  value:   { type: Number, required: true },
}, { timestamps: true });

weightLogSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WeightLog', weightLogSchema);

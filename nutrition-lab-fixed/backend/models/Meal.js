const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  user_id:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:      { type: String, required: true, trim: true },
  calories:  { type: Number, default: 0 },
  protein:   { type: Number, default: 0 },
  carbs:     { type: Number, default: 0 },
  fat:       { type: Number, default: 0 },
  time:      { type: String, default: '00:00' },
  meal_type: { type: String, enum: ['breakfast','lunch','dinner','snack','meal'], default: 'meal' },
  date:      { type: String, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Meal', mealSchema);

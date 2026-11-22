const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name:         String,
  sets:         Number,
  reps:         Number,
  weight:       Number,
  duration_min: Number,
}, { _id: false });

const workoutSchema = new mongoose.Schema({
  user_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name:            { type: String, required: true, trim: true },
  duration:        { type: Number, default: 0 },
  calories_burned: { type: Number, default: 0 },
  type:            { type: String, enum: ['strength','cardio','circuit','flexibility','other'], default: 'strength' },
  exercises:       [exerciseSchema],
  notes:           { type: String, default: '' },
  date:            { type: String, index: true },
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);

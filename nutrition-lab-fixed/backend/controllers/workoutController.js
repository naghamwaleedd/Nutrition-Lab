const Workout = require('../models/Workout');

function today() { return new Date().toISOString().split('T')[0]; }
function ok(res, d)          { res.status(200).json({ success: true,  ...d }); }
function created(res, d)     { res.status(201).json({ success: true,  ...d }); }
function fail(res, m, s=400) { res.status(s).json({   success: false, error: m }); }

const WorkoutController = {
  getAll: async (req, res) => {
    try {
      const workouts = await Workout.find({ user_id: req.user._id }).sort({ date: -1 }).limit(20).lean();
      ok(res, { workouts });
    } catch (err) { fail(res, err.message, 500); }
  },

  create: async (req, res) => {
    try {
      const { name, duration, calories_burned, type, exercises, notes, date } = req.body;
      if (!name) return fail(res, 'Workout name is required.');
      const workout = await Workout.create({
        user_id:         req.user._id,
        name,
        duration:        parseInt(duration)        || 0,
        calories_burned: parseInt(calories_burned) || 0,
        type:            type      || 'strength',
        exercises:       exercises || [],
        notes:           notes     || '',
        date:            date      || today(),
      });
      created(res, { workout });
    } catch (err) { fail(res, err.message, 500); }
  },

  remove: async (req, res) => {
    try {
      const workout = await Workout.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
      if (!workout) return fail(res, 'Workout not found.', 404);
      ok(res, { message: 'Workout deleted.' });
    } catch (err) { fail(res, err.message, 500); }
  },
};

module.exports = WorkoutController;

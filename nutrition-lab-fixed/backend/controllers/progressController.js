const WeightLog = require('../models/WeightLog');
const WaterLog  = require('../models/WaterLog');
const Meal      = require('../models/Meal');
const Workout   = require('../models/Workout');
const User      = require('../models/User');

function today() { return new Date().toISOString().split('T')[0]; }
function ok(res, d)          { res.status(200).json({ success: true,  ...d }); }
function fail(res, m, s=400) { res.status(s).json({   success: false, error: m }); }

const ProgressController = {
  getWeight: async (req, res) => {
    try {
      const log = await WeightLog.find({ user_id: req.user._id }).sort({ date: 1 }).lean();
      ok(res, { weight_log: log });
    } catch (err) { fail(res, err.message, 500); }
  },

  logWeight: async (req, res) => {
    try {
      const { value } = req.body;
      if (!value || isNaN(value)) return fail(res, 'Valid weight value required.');
      const entry = await WeightLog.findOneAndUpdate(
        { user_id: req.user._id, date: today() },
        { value: parseFloat(value) },
        { upsert: true, new: true }
      ).lean();
      await User.findByIdAndUpdate(req.user._id, { weight: parseFloat(value) });
      ok(res, { entry });
    } catch (err) { fail(res, err.message, 500); }
  },

  getWater: async (req, res) => {
    try {
      const [todayLog, history] = await Promise.all([
        WaterLog.findOne({ user_id: req.user._id, date: today() }).lean(),
        WaterLog.find({ user_id: req.user._id }).sort({ date: -1 }).limit(14).lean(),
      ]);
      ok(res, { today: todayLog ? todayLog.amount : 0, history });
    } catch (err) { fail(res, err.message, 500); }
  },

  updateWater: async (req, res) => {
    try {
      const { amount } = req.body;
      if (amount === undefined || isNaN(amount)) return fail(res, 'Valid water amount required.');
      const entry = await WaterLog.findOneAndUpdate(
        { user_id: req.user._id, date: today() },
        { amount: parseFloat(amount) },
        { upsert: true, new: true }
      ).lean();
      ok(res, { entry });
    } catch (err) { fail(res, err.message, 500); }
  },

  getStats: async (req, res) => {
    try {
      const uid    = req.user._id;
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7);
      const cutoffStr = cutoff.toISOString().split('T')[0];

      const [weightLog, waterHistory, meals7, workouts7] = await Promise.all([
        WeightLog.find({ user_id: uid }).sort({ date: 1 }).lean(),
        WaterLog.find({ user_id: uid }).sort({ date: -1 }).limit(14).lean(),
        Meal.find({ user_id: uid, date: { $gte: cutoffStr } }).lean(),
        Workout.find({ user_id: uid, date: { $gte: cutoffStr } }).lean(),
      ]);

      const byDay = {};
      meals7.forEach(m => {
        byDay[m.date] = byDay[m.date] || { cal: 0, p: 0 };
        byDay[m.date].cal += m.calories;
        byDay[m.date].p   += m.protein;
      });
      const days    = Object.values(byDay);
      const avgCal  = days.length ? Math.round(days.reduce((a, d) => a + d.cal, 0) / days.length) : 0;
      const avgProt = days.length ? Math.round(days.reduce((a, d) => a + d.p,   0) / days.length) : 0;
      const totalCalBurned = workouts7.reduce((a, w) => a + w.calories_burned, 0);

      ok(res, {
        weight_log:    weightLog,
        water_history: waterHistory,
        weekly: { avg_calories: avgCal, avg_protein: avgProt, workout_count: workouts7.length, calories_burned: totalCalBurned },
      });
    } catch (err) { fail(res, err.message, 500); }
  },
};

module.exports = ProgressController;

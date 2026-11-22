const User      = require('../models/User');
const Meal      = require('../models/Meal');
const Workout   = require('../models/Workout');
const WeightLog = require('../models/WeightLog');
const WaterLog  = require('../models/WaterLog');

function today() { return new Date().toISOString().split('T')[0]; }
function ok(res, data)          { res.status(200).json({ success: true,  ...data }); }
function fail(res, msg, st=400) { res.status(st).json({  success: false, error: msg }); }

const UserController = {
  getProfile: (req, res) => {
    ok(res, { user: req.user.toSafeObject() });
  },

  updateProfile: async (req, res) => {
    try {
      const allowed = ['name','age','weight','height','gender','activity_level','goal',
                       'goal_calories','goal_protein','goal_carbs','goal_fat','goal_water','goal_weight'];
      const updates = {};
      for (const k of allowed) if (req.body[k] !== undefined) updates[k] = req.body[k];
      const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
      ok(res, { user: updated.toSafeObject() });
    } catch (err) { fail(res, err.message, 500); }
  },

  getDashboard: async (req, res) => {
    try {
      const uid      = req.user._id;
      const todayStr = today();

      const [meals, water, workouts, weightLog] = await Promise.all([
        Meal.find({ user_id: uid, date: todayStr }).sort({ time: 1 }).lean(),
        WaterLog.findOne({ user_id: uid, date: todayStr }).lean(),
        Workout.find({ user_id: uid, date: todayStr }).lean(),
        WeightLog.find({ user_id: uid }).sort({ date: 1 }).lean(),
      ]);

      const waterAmount = water ? water.amount : 0;

      const summary = meals.reduce((a, m) => ({
        calories: a.calories + m.calories,
        protein:  a.protein  + m.protein,
        carbs:    a.carbs    + m.carbs,
        fat:      a.fat      + m.fat,
        count:    a.count    + 1,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });

      const g = req.user;
      const calScore   = Math.max(0, Math.min(100, Math.round((1 - Math.abs(summary.calories - g.goal_calories) / Math.max(1, g.goal_calories)) * 100)));
      const protScore  = Math.min(100, Math.round((summary.protein / Math.max(1, g.goal_protein)) * 100));
      const hydrScore  = Math.min(100, Math.round((waterAmount / Math.max(1, g.goal_water)) * 100));
      const macroScore = Math.min(100, Math.round(((summary.carbs / Math.max(1, g.goal_carbs)) + (summary.fat / Math.max(1, g.goal_fat))) / 2 * 100));
      const totalScore = Math.min(100, Math.round(calScore*0.3 + protScore*0.35 + hydrScore*0.15 + macroScore*0.2));

      const daysSinceJoined = Math.max(1, Math.floor((Date.now() - new Date(g.created_at)) / 86400000) + 1);

      ok(res, {
        user:   g.toSafeObject(),
        today:  { meals, summary, water: waterAmount, workouts },
        score:  { total: totalScore, calories: calScore, protein: protScore, hydration: hydrScore, macros: macroScore },
        weight: weightLog.slice(-7),
        streak: { days: daysSinceJoined },
      });
    } catch (err) { fail(res, err.message, 500); }
  },
};

module.exports = UserController;

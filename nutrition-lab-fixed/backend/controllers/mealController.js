const Meal = require('../models/Meal');

function today() { return new Date().toISOString().split('T')[0]; }
function ok(res, d)          { res.status(200).json({ success: true,  ...d }); }
function created(res, d)     { res.status(201).json({ success: true,  ...d }); }
function fail(res, m, s=400) { res.status(s).json({   success: false, error: m }); }

const MealController = {
  getAll: async (req, res) => {
    try {
      const query = { user_id: req.user._id };
      if (req.query.date) query.date = req.query.date;
      const meals = await Meal.find(query).sort({ date: -1, time: -1 }).limit(50).lean();
      ok(res, { meals });
    } catch (err) { fail(res, err.message, 500); }
  },

  create: async (req, res) => {
    try {
      const { name, calories, protein, carbs, fat, time, meal_type, date } = req.body;
      if (!name) return fail(res, 'Meal name is required.');
      const meal = await Meal.create({
        user_id:   req.user._id,
        name,
        calories:  parseInt(calories)  || 0,
        protein:   parseFloat(protein) || 0,
        carbs:     parseFloat(carbs)   || 0,
        fat:       parseFloat(fat)     || 0,
        time:      time      || new Date().toTimeString().slice(0, 5),
        meal_type: meal_type || 'meal',
        date:      date      || today(),
      });
      created(res, { meal });
    } catch (err) { fail(res, err.message, 500); }
  },

  remove: async (req, res) => {
    try {
      const meal = await Meal.findOneAndDelete({ _id: req.params.id, user_id: req.user._id });
      if (!meal) return fail(res, 'Meal not found.', 404);
      ok(res, { message: 'Meal deleted.' });
    } catch (err) { fail(res, err.message, 500); }
  },

  summary: async (req, res) => {
    try {
      const date  = req.query.date || today();
      const meals = await Meal.find({ user_id: req.user._id, date }).lean();
      const summary = meals.reduce((a, m) => ({
        calories: a.calories + m.calories,
        protein:  a.protein  + m.protein,
        carbs:    a.carbs    + m.carbs,
        fat:      a.fat      + m.fat,
        count:    a.count    + 1,
      }), { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
      ok(res, { date, summary });
    } catch (err) { fail(res, err.message, 500); }
  },
};

module.exports = MealController;

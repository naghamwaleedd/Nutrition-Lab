const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET     = process.env.JWT_SECRET     || 'nutrition_lab_jwt_secret_2025';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function ok(res, data, status = 200)    { res.status(status).json({ success: true,  ...data }); }
function fail(res, error, status = 400) { res.status(status).json({ success: false, error  }); }

const AuthController = {
  register: async (req, res) => {
    try {
      const { name, email, password, age, weight, height, gender, activity_level, goal, goal_weight } = req.body;
      if (!name || !email || !password) return fail(res, 'Name, email and password are required.');
      if (password.length < 6)          return fail(res, 'Password must be at least 6 characters.');
      if (await User.findOne({ email })) return fail(res, 'Email already registered.');

      const w = parseFloat(weight) || 70;
      const h = parseFloat(height) || 170;
      const a = parseInt(age)      || 25;
      const actMap    = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 };
      const bmr       = gender === 'female' ? 10*w + 6.25*h - 5*a - 161 : 10*w + 6.25*h - 5*a + 5;
      const tdee      = Math.round(bmr * (actMap[activity_level] || 1.55));
      const adjust    = { cut: -500, maintain: 0, bulk: 300, recomp: 0 };
      const goal_calories = tdee + (adjust[goal] || 0);
      const goal_protein  = Math.round(w * 2.0);
      const goal_fat      = Math.round(goal_calories * 0.25 / 9);
      const goal_carbs    = Math.max(0, Math.round((goal_calories - goal_protein*4 - goal_fat*9) / 4));

      const user  = await User.create({ name, email, password, age: a, weight: w, height: h, gender: gender || 'male', activity_level: activity_level || 'moderate', goal: goal || 'maintain', goal_calories, goal_protein, goal_carbs, goal_fat, goal_water: 3.0, goal_weight: parseFloat(goal_weight) || 0 });
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      ok(res, { token, user: user.toSafeObject() }, 201);
    } catch (err) { fail(res, err.message, 500); }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return fail(res, 'Email and password required.');
      const user = await User.findOne({ email });
      if (!user || !(await user.verifyPassword(password)))
        return fail(res, 'Invalid email or password.', 401);
      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
      ok(res, { token, user: user.toSafeObject() });
    } catch (err) { fail(res, err.message, 500); }
  },

  logout: (_req, res) => {
    res.json({ success: true, message: 'Logged out successfully.' });
  },
};

module.exports = AuthController;

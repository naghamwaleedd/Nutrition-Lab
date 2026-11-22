const Meal      = require('../models/Meal');
const Workout   = require('../models/Workout');
const WeightLog = require('../models/WeightLog');
const WaterLog  = require('../models/WaterLog');

function today() { return new Date().toISOString().split('T')[0]; }
function ok(res, d)          { res.status(200).json({ success: true,  ...d }); }
function fail(res, m, s=400) { res.status(s).json({   success: false, error: m }); }

async function getMealSummary(userId, date) {
  const meals = await Meal.find({ user_id: userId, date }).lean();
  return meals.reduce((a, m) => ({
    calories: a.calories + m.calories, protein: a.protein + m.protein,
    carbs: a.carbs + m.carbs, fat: a.fat + m.fat, count: a.count + 1,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 });
}

const CoachController = {
  getInsights: async (req, res) => {
    try {
      const user     = req.user;
      const uid      = user._id;
      const todayStr = today();

      const [summary, waterLog, weightLog, todayWorkouts] = await Promise.all([
        getMealSummary(uid, todayStr),
        WaterLog.findOne({ user_id: uid, date: todayStr }).lean(),
        WeightLog.find({ user_id: uid }).sort({ date: 1 }).lean(),
        Workout.find({ user_id: uid, date: todayStr }).lean(),
      ]);

      const water    = waterLog ? waterLog.amount : 0;
      const insights = [];

      const protPct = user.goal_protein > 0 ? summary.protein / user.goal_protein : 0;
      if (protPct < 0.6) {
        insights.push({ type: 'WARNING', icon: '🥩', title: 'Low Protein Alert', message: `You've hit only ${Math.round(protPct*100)}% of your protein goal today. Add ${user.goal_protein - summary.protein}g more. Try a protein shake or chicken breast.` });
      } else if (protPct >= 0.95) {
        insights.push({ type: 'SUCCESS', icon: '💪', title: 'Protein Target Hit!', message: `Excellent! You've reached ${summary.protein}g protein (${Math.round(protPct*100)}% of goal). Keep it up!` });
      }

      if (water < user.goal_water * 0.5) {
        insights.push({ type: 'WARNING', icon: '💧', title: 'Hydration Alert', message: `Only ${water}L logged so far. You need ${(user.goal_water - water).toFixed(1)}L more. Drink a glass now!` });
      }

      const calPct = user.goal_calories > 0 ? summary.calories / user.goal_calories : 0;
      if (calPct > 1.1) {
        insights.push({ type: 'WARNING', icon: '⚠️', title: 'Over Calorie Target', message: `You're ${summary.calories - user.goal_calories} kcal over your daily target. Consider a lighter dinner.` });
      }

      if (weightLog.length >= 4) {
        const last4 = weightLog.slice(-4).map(w => w.value);
        const diff  = Math.abs(last4[last4.length - 1] - last4[0]);
        if (diff < 0.3 && user.goal === 'cut') {
          insights.push({ type: 'INFO', icon: '📊', title: 'Plateau Detected', message: `Weight barely changed over 3 weeks (${diff.toFixed(1)}kg). Try reducing calories by 150/day or adding 20 min cardio.` });
        }
      }

      if (weightLog.length >= 2) {
        const delta = weightLog[0].value - weightLog[weightLog.length - 1].value;
        if (delta > 1 && user.goal === 'cut') {
          insights.push({ type: 'SUCCESS', icon: '📉', title: `Down ${delta.toFixed(1)}kg!`, message: `Great progress! You've lost ${delta.toFixed(1)}kg since you started. Keep the deficit consistent.` });
        }
      }

      if (todayWorkouts.length === 0) {
        insights.push({ type: 'INFO', icon: '🏋️', title: 'No Workout Logged', message: `No workout logged today. Even 30 minutes of light activity improves your Nutrition Score by 10+ points.` });
      }

      const totalCal = summary.protein*4 + summary.carbs*4 + summary.fat*9;
      if (totalCal > 0 && (summary.fat*9 / totalCal) * 100 > 40) {
        insights.push({ type: 'INFO', icon: '🥑', title: 'High Fat Ratio', message: `Fat is ${Math.round((summary.fat*9/totalCal)*100)}% of today's calories. Aim for 25–30%.` });
      }

      if (insights.length === 0) {
        insights.push({ type: 'SUCCESS', icon: '🏆', title: 'Crushing It!', message: `All metrics look great today! Nutrition is on point, hydration is solid. Serious progress.` });
      }

      ok(res, { insights });
    } catch (err) { fail(res, err.message, 500); }
  },

  chat: async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || !message.trim()) return fail(res, 'Message is required.');

      const user     = req.user;
      const uid      = user._id;
      const msg      = message.toLowerCase();
      const todayStr = today();

      const [summary, waterLog] = await Promise.all([
        getMealSummary(uid, todayStr),
        WaterLog.findOne({ user_id: uid, date: todayStr }).lean(),
      ]);
      const water = waterLog ? waterLog.amount : 0;

      let reply;

      if (msg.includes('calculate') || msg.includes('tdee') || msg.includes('bmr') || msg.includes('how many calories')) {
        const { weight: w, height: h, age: a, gender, activity_level, goal_calories, goal_protein, goal_carbs, goal_fat, goal, goal_weight, weight } = user;
        const bmr  = gender === 'female' ? Math.round(10*w + 6.25*h - 5*a - 161) : Math.round(10*w + 6.25*h - 5*a + 5);
        const af   = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, athlete: 1.9 }[activity_level] || 1.55;
        const tdee = Math.round(bmr * af);
        const gw   = goal_weight > 0 ? ` Goal weight: **${goal_weight}kg** (${(weight - goal_weight).toFixed(1)}kg to go).` : '';
        reply = `📊 **Your Calorie Breakdown:**\n\nBMR: **${bmr} kcal** · TDEE: **${tdee} kcal**\n\n🔥 Cut: **${tdee-500} kcal/day** · ⚖️ Maintain: **${tdee} kcal/day** · 💪 Bulk: **${tdee+300} kcal/day**\n\nYour target: **${goal_calories} kcal** (${goal} goal).${gw}\nProtein: **${goal_protein}g** · Carbs: **${goal_carbs}g** · Fat: **${goal_fat}g**`;
      } else if (msg.includes('give me a workout') || msg.includes('generate workout') || msg.includes('workout plan') || msg.includes('suggest a workout')) {
        const isCardio = msg.includes('cardio') || msg.includes('run') || msg.includes('cycling');
        const isUpper  = msg.includes('upper') || msg.includes('chest') || msg.includes('shoulder') || msg.includes('arm');
        const isLower  = msg.includes('lower') || msg.includes('leg') || msg.includes('squat') || msg.includes('glute');
        if (isCardio) reply = `🏃 **Cardio Session for ${user.name}**\n\nWarm-up 5 min brisk walk → 25 min treadmill intervals (2 min fast / 1 min walk ×6) + 10 min rowing → Cool-down 5 min.\n\nEst. burn: **280–350 kcal**`;
        else if (isUpper) reply = `💪 **Upper Body for ${user.name}**\n\nBench Press 4×8 | Row 4×8 | Overhead Press 3×10 | Pull-ups 3×8 | Tricep Dips 3×12 | Bicep Curls 3×12\n\nEst: **55 min · 350 kcal**`;
        else if (isLower) reply = `🦵 **Lower Body for ${user.name}**\n\nBack Squat 4×8 | RDL 4×8 | Leg Press 3×12 | Walking Lunges 3×10/leg | Leg Curl 3×12 | Calf Raises 4×15\n\nEst: **60 min · 420 kcal**`;
        else reply = `🏋️ **Full Body for ${user.name}**\n\nSquat 4×8 | Bench 4×8 | Deadlift 3×6 | Pull-ups 3×8 | OHP 3×10 | Plank 3×45s\n\nEst: **60 min · 400 kcal**\n\nTip: Ask for "upper body", "lower body", or "cardio" workouts for targeted plans.`;
      } else if (msg.includes('goal weight')) {
        if (!user.goal_weight) reply = `You haven't set a goal weight yet. Update it in your profile settings!`;
        else {
          const diff = Math.abs(user.weight - user.goal_weight).toFixed(1);
          reply = `🎯 Current: **${user.weight}kg** → Goal: **${user.goal_weight}kg** (${diff}kg to go)\n\nAt 0.5kg/week, ~**${Math.round(diff / 0.5)} weeks** to reach your goal.`;
        }
      } else if (msg.includes('calorie') || msg.includes('calories')) {
        reply = `Your target is **${user.goal_calories} kcal/day**. Today: **${summary.calories} kcal** (${Math.round(summary.calories/user.goal_calories*100)}%). ${summary.calories < user.goal_calories ? `${user.goal_calories - summary.calories} kcal remaining.` : `Target reached — watch evening snacks.`}`;
      } else if (msg.includes('protein')) {
        reply = `Target: **${user.goal_protein}g/day**. Today: **${summary.protein}g** (${Math.round(summary.protein/user.goal_protein*100)}%). ${summary.protein < user.goal_protein ? `Need ${user.goal_protein - summary.protein}g more — a chicken breast has ~45g.` : `Protein goal hit!`}`;
      } else if (msg.includes('water') || msg.includes('hydration')) {
        reply = `Logged **${water}L** of **${user.goal_water}L** today. ${water < user.goal_water ? `Drink ${(user.goal_water - water).toFixed(1)}L more.` : `Excellent hydration!`}`;
      } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
        reply = `Hello ${user.name}! 👋 Try:\n• "Calculate my TDEE"\n• "Give me a workout"\n• "What's my goal weight progress?"\n• "How are my calories today?"`;
      } else {
        reply = `Got it, ${user.name}! You've logged ${summary.calories} kcal and ${summary.protein}g protein today. Try: "Calculate my TDEE", "Give me a workout", or "What's my goal weight progress?"`;
      }

      ok(res, { reply, timestamp: new Date().toISOString() });
    } catch (err) { fail(res, err.message, 500); }
  },
};

module.exports = CoachController;

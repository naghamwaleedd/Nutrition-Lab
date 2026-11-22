// ─────────────────────────────────────────────────────────────────
//  Nutrition Lab — Database Seeder
//  Run: node backend/data/seed.js
// ─────────────────────────────────────────────────────────────────
require('dotenv').config();
const { connectDB } = require('./db');
const User      = require('../models/User');
const Meal      = require('../models/Meal');
const Workout   = require('../models/Workout');
const WeightLog = require('../models/WeightLog');
const WaterLog  = require('../models/WaterLog');

function today() { return new Date().toISOString().split('T')[0]; }
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

async function seed() {
  await connectDB();

  // Clear existing demo data
  const existing = await User.findOne({ email: 'alex@nutritionlab.com' });
  if (existing) {
    await Promise.all([
      Meal.deleteMany({ user_id: existing._id }),
      Workout.deleteMany({ user_id: existing._id }),
      WeightLog.deleteMany({ user_id: existing._id }),
      WaterLog.deleteMany({ user_id: existing._id }),
      User.deleteOne({ _id: existing._id }),
    ]);
  }

  const user = await User.create({
    name: 'Alex Hassan', email: 'alex@nutritionlab.com', password: 'demo123',
    age: 24, weight: 79.2, height: 178, gender: 'male',
    activity_level: 'moderate', goal: 'cut',
    goal_calories: 1950, goal_protein: 158, goal_carbs: 188, goal_fat: 54,
    goal_water: 3.0, goal_weight: 74,
    xp: 2450, level: 8,
    achievements: ['macro_scientist', 'hydration_king', 'protein_master'],
    created_at: new Date('2025-01-15'),
  });

  const uid = user._id;

  await Meal.insertMany([
    { user_id: uid, name: 'Oats + Banana + Honey',       calories: 380, protein: 12, carbs: 68, fat: 6,  time: '08:00', date: today(),    meal_type: 'breakfast' },
    { user_id: uid, name: 'Grilled Chicken + Brown Rice', calories: 540, protein: 46, carbs: 55, fat: 10, time: '13:00', date: today(),    meal_type: 'lunch'     },
    { user_id: uid, name: 'Greek Yogurt + Almonds',       calories: 210, protein: 18, carbs: 14, fat: 9,  time: '16:30', date: today(),    meal_type: 'snack'     },
    { user_id: uid, name: 'Protein Shake',                calories: 180, protein: 32, carbs: 8,  fat: 3,  time: '19:00', date: today(),    meal_type: 'snack'     },
    { user_id: uid, name: 'Scrambled Eggs + Toast',       calories: 420, protein: 28, carbs: 35, fat: 18, time: '08:30', date: daysAgo(1), meal_type: 'breakfast' },
    { user_id: uid, name: 'Tuna Salad',                   calories: 380, protein: 42, carbs: 15, fat: 14, time: '13:00', date: daysAgo(1), meal_type: 'lunch'     },
    { user_id: uid, name: 'Beef Stir Fry + Rice',         calories: 620, protein: 48, carbs: 60, fat: 16, time: '19:30', date: daysAgo(1), meal_type: 'dinner'    },
    { user_id: uid, name: 'Omelette + Veggies',           calories: 310, protein: 24, carbs: 12, fat: 18, time: '09:00', date: daysAgo(2), meal_type: 'breakfast' },
    { user_id: uid, name: 'Chicken Wrap',                 calories: 490, protein: 38, carbs: 42, fat: 14, time: '13:30', date: daysAgo(2), meal_type: 'lunch'     },
    { user_id: uid, name: 'Salmon + Sweet Potato',        calories: 560, protein: 44, carbs: 48, fat: 16, time: '20:00', date: daysAgo(2), meal_type: 'dinner'    },
  ]);

  await Workout.insertMany([
    { user_id: uid, name: 'Upper Body Strength', date: today(),    duration: 55, calories_burned: 380, type: 'strength',
      exercises: [{ name:'Bench Press',sets:4,reps:8,weight:80 },{ name:'Shoulder Press',sets:3,reps:10,weight:50 },{ name:'Pull-ups',sets:3,reps:8,weight:0 },{ name:'Tricep Dips',sets:3,reps:12,weight:0 },{ name:'Lateral Raises',sets:3,reps:12,weight:12 }],
      notes: 'Great session, energy was high' },
    { user_id: uid, name: 'Cardio + Core',        date: daysAgo(1), duration: 40, calories_burned: 310, type: 'cardio',
      exercises: [{ name:'Treadmill',sets:1,reps:1,weight:0,duration_min:20 },{ name:'Cycling',sets:1,reps:1,weight:0,duration_min:15 },{ name:'Plank',sets:3,reps:1,weight:0,duration_min:1 },{ name:'Crunches',sets:3,reps:25,weight:0 }],
      notes: 'Steady state cardio, felt good' },
    { user_id: uid, name: 'Lower Body Power',     date: daysAgo(2), duration: 65, calories_burned: 440, type: 'strength',
      exercises: [{ name:'Back Squats',sets:4,reps:8,weight:100 },{ name:'Deadlifts',sets:3,reps:6,weight:120 },{ name:'Leg Press',sets:3,reps:12,weight:160 },{ name:'Leg Curl',sets:3,reps:12,weight:50 },{ name:'Calf Raises',sets:4,reps:15,weight:60 }],
      notes: 'PR on deadlifts!' },
    { user_id: uid, name: 'Full Body Circuit',    date: daysAgo(4), duration: 50, calories_burned: 400, type: 'circuit',
      exercises: [{ name:'Burpees',sets:4,reps:15,weight:0 },{ name:'Push-ups',sets:4,reps:20,weight:0 },{ name:'Squats',sets:4,reps:20,weight:0 },{ name:'Mountain Climbers',sets:3,reps:30,weight:0 }],
      notes: 'High intensity, sweated a lot' },
  ]);

  await WeightLog.insertMany([
    { user_id: uid, date: daysAgo(56), value: 83.5 },
    { user_id: uid, date: daysAgo(49), value: 82.8 },
    { user_id: uid, date: daysAgo(42), value: 82.1 },
    { user_id: uid, date: daysAgo(35), value: 81.4 },
    { user_id: uid, date: daysAgo(28), value: 80.7 },
    { user_id: uid, date: daysAgo(21), value: 80.1 },
    { user_id: uid, date: daysAgo(14), value: 79.8 },
    { user_id: uid, date: daysAgo(7),  value: 79.5 },
    { user_id: uid, date: daysAgo(3),  value: 79.3 },
    { user_id: uid, date: today(),     value: 79.2 },
  ]);

  await WaterLog.insertMany([
    { user_id: uid, date: today(),    amount: 1.8 },
    { user_id: uid, date: daysAgo(1), amount: 2.4 },
    { user_id: uid, date: daysAgo(2), amount: 3.0 },
    { user_id: uid, date: daysAgo(3), amount: 2.2 },
    { user_id: uid, date: daysAgo(4), amount: 1.9 },
    { user_id: uid, date: daysAgo(5), amount: 2.8 },
    { user_id: uid, date: daysAgo(6), amount: 2.5 },
  ]);

  console.log('[Seed] Demo user created: alex@nutritionlab.com / demo123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });

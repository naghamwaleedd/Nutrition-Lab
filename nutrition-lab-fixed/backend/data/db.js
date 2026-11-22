// ─────────────────────────────────────────────────────────────────
//  Nutrition Lab — MongoDB Connection (Mongoose)
// ─────────────────────────────────────────────────────────────────
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nutrition-lab';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`[DB] Connected to MongoDB: ${MONGODB_URI.replace(/:\/\/.*@/, '://**@')}`);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };

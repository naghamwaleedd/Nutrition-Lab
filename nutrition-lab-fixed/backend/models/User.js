const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true },
  age:            { type: Number, default: 25 },
  weight:         { type: Number, default: 70 },
  height:         { type: Number, default: 170 },
  gender:         { type: String, enum: ['male', 'female'], default: 'male' },
  activity_level: { type: String, enum: ['sedentary','light','moderate','active','athlete'], default: 'moderate' },
  goal:           { type: String, enum: ['cut','maintain','bulk','recomp'], default: 'maintain' },
  goal_calories:  { type: Number, default: 2000 },
  goal_protein:   { type: Number, default: 150 },
  goal_carbs:     { type: Number, default: 200 },
  goal_fat:       { type: Number, default: 55 },
  goal_water:     { type: Number, default: 3.0 },
  goal_weight:    { type: Number, default: 0 },
  xp:             { type: Number, default: 0 },
  level:          { type: Number, default: 1 },
  achievements:   [String],
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

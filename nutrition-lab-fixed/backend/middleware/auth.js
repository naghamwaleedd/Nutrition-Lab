const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'nutrition_lab_jwt_secret_2025';

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, error: 'No token provided. Please log in.' });

  let payload;
  try { payload = jwt.verify(token, JWT_SECRET); }
  catch { return res.status(401).json({ success: false, error: 'Invalid or expired session. Please log in again.' }); }

  const user = await User.findById(payload.userId);
  if (!user) return res.status(401).json({ success: false, error: 'User not found.' });

  req.user  = user;
  req.token = token;
  next();
}

module.exports = { authenticate };

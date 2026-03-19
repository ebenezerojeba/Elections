import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/** Sign a JWT for a user */
const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role, pollingUnit: user.pollingUnit },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

/**
 * POST /api/auth/register
 * Creates a new agent account (open endpoint — lock behind admin in production)
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, pollingUnit } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered' });
  }

  const user = await User.create({ name, email, password, pollingUnit });
  const token = signToken(user);

  res.status(201).json({
    success: true,
    message: 'Agent registered successfully',
    token,
    user: {
      id:          user._id,
      name:        user.name,
      email:       user.email,
      pollingUnit: user.pollingUnit,
      role:        user.role,
    },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password (schema has select: false)
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account has been deactivated' });
  }

  const token = signToken(user);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id:          user._id,
      name:        user.name,
      email:       user.email,
      pollingUnit: user.pollingUnit,
      role:        user.role,
    },
  });
});

/**
 * GET /api/auth/me
 * Returns the authenticated agent's profile
 */
export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
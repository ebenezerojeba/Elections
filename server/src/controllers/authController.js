

// import jwt from 'jsonwebtoken';
// import mongoose from 'mongoose';
// import User from '../models/User.js';
// import { asyncHandler } from '../middleware/errorHandler.js';

// const signToken = (user) =>
//   jwt.sign(
//     { id: user._id, email: user.email, role: user.role, lcda: user.lcda, ward: user.ward },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
//   );

// /**
//  * POST /api/auth/register
//  */
// export const register = asyncHandler(async (req, res) => {
//   const { name, email, password, lcda, ward, role } = req.body; // ✅ lcda + ward added

//   // ── 1. Early validation before hitting Mongoose ──────────────────────────
//   const resolvedRole = role === 'admin' ? 'admin' : 'agent';

//   if (resolvedRole === 'agent') {
//     if (!lcda || !ward) {
//       return res.status(400).json({
//         success: false,
//         message: 'LCDA and ward assignment are required for agent accounts.',
//         missing: { lcda: !lcda, ward: !ward },
//       });
//     }

//     if (!mongoose.isValidObjectId(lcda) || !mongoose.isValidObjectId(ward)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid LCDA or ward identifier.',
//       });
//     }
//   }

//   // ── 2. Duplicate email check ─────────────────────────────────────────────
//   const existing = await User.findOne({ email });
//   if (existing) {
//     return res.status(409).json({ success: false, message: 'Email already registered.' });
//   }

//   // ── 3. Create user — pass lcda + ward ────────────────────────────────────
//   const user = await User.create({
//     name,
//     email,
//     password,
//     role: resolvedRole,
//     ...(resolvedRole === 'agent' && { lcda, ward }), // only spread for agents
//   });

//   const token = signToken(user);

//   res.status(201).json({
//     success: true,
//     message: 'Agent registered successfully.',
//     token,
//     user: {
//       id:    user._id,
//       name:  user.name,
//       email: user.email,
//       lcda:  user.lcda,
//       ward:  user.ward,
//       role:  user.role,
//     },
//   });
// });

// /**
//  * POST /api/auth/login
//  */
// export const login = asyncHandler(async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email }).select('+password').populate('lcda ward');
//   if (!user || !(await user.comparePassword(password))) {
//     return res.status(401).json({ success: false, message: 'Invalid credentials.' });
//   }

//   if (!user.isActive) {
//     return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
//   }

//   const token = signToken(user);

//   res.json({
//     success: true,
//     message: 'Login successful.',
//     token,
//     user: {
//       id:    user._id,
//       name:  user.name,
//       email: user.email,
//       lcda:  user.lcda,  // populated: { _id, name }
//       ward:  user.ward,  // populated: { _id, name }
//       role:  user.role,
//     },
//   });
// });

// /**
//  * GET /api/auth/me
//  */
// export const getMe = asyncHandler(async (req, res) => {
//   // Populate so frontend always gets full lcda/ward names
//   const user = await User.findById(req.user._id).populate('lcda ward');
//   res.json({ success: true, user });
// });




import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, role: user.role, lcda: user.lcda },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

/**
 * POST /api/auth/register
 * Agents are assigned to an LCDA only — ward is chosen at submission time.
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, lcda, role } = req.body;

  const resolvedRole = role === 'admin' ? 'admin' : 'agent';

  if (resolvedRole === 'agent') {
    if (!lcda) {
      return res.status(400).json({
        success: false,
        message: 'LCDA assignment is required for agent accounts.',
      });
    }
    if (!mongoose.isValidObjectId(lcda)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid LCDA identifier.',
      });
    }
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: resolvedRole,
    ...(resolvedRole === 'agent' && { lcda }),
  });

  const token = signToken(user);

  res.status(201).json({
    success: true,
    message: 'Agent registered successfully.',
    token,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      lcda:  user.lcda,
      role:  user.role,
    },
  });
});

/**
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password').populate('lcda');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account has been deactivated.' });
  }

  const token = signToken(user);

  res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id:    user._id,
      name:  user.name,
      email: user.email,
      lcda:  user.lcda,  // populated: { _id, name }
      role:  user.role,
    },
  });
});

/**
 * GET /api/auth/me
 */
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('lcda');
  res.json({ success: true, user });
});
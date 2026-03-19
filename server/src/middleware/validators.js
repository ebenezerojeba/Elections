import { body, validationResult } from 'express-validator';

/**
 * Runs after validation chains — returns 422 with field errors if invalid.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors:  errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

export const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('pollingUnit').trim().notEmpty().withMessage('Polling unit is required'),
];

export const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const resultRules = [
  body('pollingUnit').trim().notEmpty().withMessage('Polling unit is required'),
  body('results')
    .isArray({ min: 1 })
    .withMessage('results must be a non-empty array'),
  body('results.*.party')
    .trim()
    .notEmpty()
    .withMessage('Each result must include a party name'),
  body('results.*.votes')
    .isInt({ min: 0 })
    .withMessage('Votes must be a non-negative integer'),
];
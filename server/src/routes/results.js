import { Router } from 'express';
import {
  submitResult, getResults, getSummary,
  getResultById, updateStatus,
} from '../controllers/resultsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { resultRules, validate } from '../middleware/validators.js';
import { upload } from '../config/cloudinary.js';
import rateLimit from 'express-rate-limit';

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Submission rate limit reached' },
});

// Parses the results JSON string from FormData into a real array
// so express-validator's isArray() check passes
const parseResultsField = (req, _res, next) => {
  if (req.body.results && typeof req.body.results === 'string') {
    try {
      req.body.results = JSON.parse(req.body.results);
    } catch {
      req.body.results = [];
    }
  }
  next();
};

router.get('/',        getResults);
router.get('/summary', getSummary);
router.get('/:id',     getResultById);

router.post(
  '/',
  protect,
  submitLimiter,
  upload.single('image'),
  parseResultsField,       // ← parse before validation
  resultRules,
  validate,
  submitResult
);

router.patch('/:id/status', protect, authorize('admin'), updateStatus);

export default router;
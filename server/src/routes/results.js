import { Router } from 'express';
import {
  submitResult, getResults, getSummary,
  getResultById, updateStatus,
  getBatchSummaries,
} from '../controllers/resultsController.js';
import { protect, authorize, requireAdmin } from '../middleware/auth.js';
import { resultRules, validate } from '../middleware/validators.js';
import { upload } from '../config/cloudinary.js';
import rateLimit from 'express-rate-limit';
import { getLcdas, getWardsByLcda } from '../controllers/LcdaController.js';

// ── NEW: LCDA + Ward controllers ─────────────────────────────────────────────
// import { getLcdas, getWardsByLcda } from '../controllers/lcdaController.js'

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Submission rate limit reached' },
});

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

// ── NEW: LCDA + Ward routes (public — called before login) ───────────────────
router.get('/lcdas',            getLcdas);
router.get('/lcdas/:id/wards',  getWardsByLcda);

// ── Existing routes — unchanged ──────────────────────────────────────────────
router.get('/',        getResults);
router.get('/summary', getSummary);
// In your results routes file
router.get('/summaries/batch', getBatchSummaries)
router.get('/:id',     getResultById);

router.post(
  '/',
  protect,
  submitLimiter,
  upload.single('image'),
  parseResultsField,
  resultRules,
  validate,
  submitResult
);

router.patch('/:id/status', protect, requireAdmin, updateStatus);

export default router;
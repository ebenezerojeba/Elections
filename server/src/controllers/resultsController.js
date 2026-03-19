import ElectionResult from '../models/ElectionResult.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Retrieves the io instance attached to the Express app.
 * Avoids circular imports by reading from app context at call time.
 */
const getIO = (req) => req.app.get('io');

// ---------------------------------------------------------------------------
// POST /api/results  (protected — agent only)
// ---------------------------------------------------------------------------
export const submitResult = asyncHandler(async (req, res) => {
  const { pollingUnit, results } = req.body;

  // Enforce that an agent can only submit for their own assigned polling unit
  if (req.user.pollingUnit !== pollingUnit) {
    return res.status(403).json({
      success: false,
      message: `You are only authorised to submit results for polling unit: ${req.user.pollingUnit}`,
    });
  }

  // Check for existing submission (belt-and-suspenders alongside the unique index)
  const existing = await ElectionResult.findOne({ pollingUnit });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: `Results for polling unit '${pollingUnit}' have already been submitted`,
    });
  }

  const resultDoc = await ElectionResult.create({
    pollingUnit,
    agent:     req.user._id,
    agentName: req.user.name,
    results,                              // [{ party, votes }]
    imageUrl:       req.file?.path  || null,   // Cloudinary secure URL
    imagePublicId:  req.file?.filename || null,
  });

  // Populate agent info before broadcasting
  await resultDoc.populate('agent', 'name email pollingUnit');

  // --- Real-time broadcast to all dashboard clients ---
  getIO(req).to('results_room').emit('new_result', {
    result:    resultDoc,
    timestamp: new Date().toISOString(),
  });

  res.status(201).json({
    success: true,
    message: 'Election results submitted successfully',
    result:  resultDoc,
  });
});

// ---------------------------------------------------------------------------
// GET /api/results  (public)
// ---------------------------------------------------------------------------
export const getResults = asyncHandler(async (req, res) => {
  const page  = Math.max(parseInt(req.query.page  || '1', 10), 1);
  const limit = Math.min(parseInt(req.query.limit || '50', 10), 100);
  const skip  = (page - 1) * limit;

  const [results, total] = await Promise.all([
    ElectionResult.find()
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('agent', 'name pollingUnit'),
    ElectionResult.countDocuments(),
  ]);

  res.json({
    success: true,
    total,
    page,
    pages: Math.ceil(total / limit),
    results,
  });
});

// ---------------------------------------------------------------------------
// GET /api/results/summary  (public — aggregated totals per party)
// ---------------------------------------------------------------------------
export const getSummary = asyncHandler(async (_req, res) => {
  const [partyTotals, unitCount, recentResults] = await Promise.all([
    // Unwind the results array and group by party
    ElectionResult.aggregate([
      { $unwind: '$results' },
      {
        $group: {
          _id:        '$results.party',
          totalVotes: { $sum: '$results.votes' },
          unitCount:  { $sum: 1 },
        },
      },
      { $sort: { totalVotes: -1 } },
      {
        $project: {
          _id:        0,
          party:      '$_id',
          totalVotes: 1,
          unitCount:  1,
        },
      },
    ]),

    ElectionResult.countDocuments(),

    // 5 most recent submissions for the live feed
    ElectionResult.find()
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('pollingUnit agentName results totalVotes submittedAt status'),
  ]);

  const grandTotal = partyTotals.reduce((s, p) => s + p.totalVotes, 0);

  res.json({
    success: true,
    summary: {
      grandTotal,
      reportingUnits: unitCount,
      parties:        partyTotals,
      recent:         recentResults,
    },
  });
});

// ---------------------------------------------------------------------------
// GET /api/results/:id  (public)
// ---------------------------------------------------------------------------
export const getResultById = asyncHandler(async (req, res) => {
  const result = await ElectionResult.findById(req.params.id).populate(
    'agent',
    'name email pollingUnit'
  );

  if (!result) {
    return res.status(404).json({ success: false, message: 'Result not found' });
  }

  res.json({ success: true, result });
});

// ---------------------------------------------------------------------------
// PATCH /api/results/:id/status  (admin only)
// ---------------------------------------------------------------------------
export const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'verified', 'rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const result = await ElectionResult.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!result) {
    return res.status(404).json({ success: false, message: 'Result not found' });
  }

  // Notify dashboard of status change
  getIO(req).to('results_room').emit('result_updated', {
    resultId: result._id,
    status:   result.status,
  });

  res.json({ success: true, result });
});
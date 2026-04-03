// import mongoose from 'mongoose';
// import ElectionResult from '../models/ElectionResult.js';
// import { asyncHandler } from '../middleware/errorHandler.js';

// const getIO = (req) => req.app.get('io');

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /api/results  (protected — agent only)
// // ─────────────────────────────────────────────────────────────────────────────
// export const submitResult = asyncHandler(async (req, res) => {
//   const { results: partyVotes } = req.body;
//   const { _id: agentId, name: agentName, lcda, ward } = req.user;

//   if (!lcda || !ward) {
//     return res.status(400).json({
//       success: false,
//       message: 'Your account has no LCDA/ward assignment. Contact an administrator.',
//     });
//   }

//   // Belt-and-suspenders duplicate check alongside the DB unique index on ward
//   const existing = await ElectionResult.findOne({ ward });
//   if (existing) {
//     return res.status(409).json({
//       success: false,
//       message: 'Results for your ward have already been submitted',
//     });
//   }

//   const result = await ElectionResult.create({
//     lcda,
//     ward,
//     agent:         agentId,
//     agentName,
//     results:       partyVotes,
//     imageUrl:      req.file?.path     || null,
//     imagePublicId: req.file?.filename || null,
//     status:        'pending',
//   });

//   await result.populate('lcda', 'name code');
//   await result.populate('ward', 'name code');
//   await result.populate('agent', 'name email');

//   const io = getIO(req);
//   if (io) {
//     io.to('results_room').emit('new_result', {
//       result,
//       timestamp: new Date().toISOString(),
//     });
//   }

//   return res.status(201).json({
//     success: true,
//     message: 'Election results submitted successfully',
//     result,
//   });
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/results  (public)
// // Supports: ?scope=lcda&id=<lcdaId>  |  ?scope=ward&id=<wardId>
// //           ?page=1&limit=50
// // ─────────────────────────────────────────────────────────────────────────────
// export const getResults = asyncHandler(async (req, res) => {
//   const { scope, id } = req.query;
//   const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
//   const limit = Math.min(parseInt(req.query.limit || '100', 10), 200);
//   const skip  = (page - 1) * limit;

//   const filter = {};
//   if (scope === 'lcda' && id && mongoose.isValidObjectId(id)) filter.lcda = id;
//   if (scope === 'ward' && id && mongoose.isValidObjectId(id)) filter.ward = id;

//   const [results, total] = await Promise.all([
//     ElectionResult.find(filter)
//       .populate('lcda',  'name code')
//       .populate('ward',  'name code')
//       .populate('agent', 'name email')
//       .sort({ submittedAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean(),
//     ElectionResult.countDocuments(filter),
//   ]);

//   return res.json({
//     success: true,
//     total,
//     page,
//     pages: Math.ceil(total / limit),
//     results,
//   });
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/results/summary  (public — aggregated totals per party)
// // Supports: ?scope=lcda&id=<lcdaId>  |  ?scope=ward&id=<wardId>
// // ─────────────────────────────────────────────────────────────────────────────
// export const getSummary = asyncHandler(async (req, res) => {
//   const { scope, id } = req.query;

//   const match = {};
//   if (scope === 'lcda' && id && mongoose.isValidObjectId(id)) {
//     match.lcda = new mongoose.Types.ObjectId(id);
//   }
//   if (scope === 'ward' && id && mongoose.isValidObjectId(id)) {
//     match.ward = new mongoose.Types.ObjectId(id);
//   }

//   const [partyTotals, reportingUnits, recentResults] = await Promise.all([
//     ElectionResult.aggregate([
//       { $match: match },
//       { $unwind: '$results' },
//       {
//         $group: {
//           _id:        '$results.party',
//           totalVotes: { $sum: '$results.votes' },
//         },
//       },
//       { $sort: { totalVotes: -1 } },
//       { $project: { _id: 0, party: '$_id', totalVotes: 1 } },
//     ]),

//     ElectionResult.countDocuments(match),

//     ElectionResult.find(match)
//       .populate('lcda', 'name')
//       .populate('ward', 'name')
//       .sort({ submittedAt: -1 })
//       .limit(5)
//       .select('lcda ward agentName results totalVotes submittedAt status')
//       .lean(),
//   ]);

//   const grandTotal = partyTotals.reduce((s, p) => s + p.totalVotes, 0);

//   return res.json({
//     success: true,
//     parties:        partyTotals,
//     grandTotal,
//     reportingUnits,
//     recent:         recentResults,
//   });
// });


// // GET /api/results/summaries/batch?ids=id1,id2,id3
// export const getBatchSummaries = asyncHandler(async (req, res) => {
//   const { ids } = req.query;
//   if (!ids) return res.status(400).json({ message: "No IDs provided" });

//   const idArray = ids.split(',').map(id => new mongoose.Types.ObjectId(id));

//   const aggregation = await ElectionResult.aggregate([
//     { $match: { lcda: { $in: idArray } } },
//     { $unwind: '$results' },
//     {
//       $group: {
//         _id: { lcda: '$lcda', party: '$results.party' },
//         totalVotes: { $sum: '$results.votes' },
//         grandTotal: { $sum: '$results.votes' } // We'll refine this in project
//       }
//     },
//     {
//       $group: {
//         _id: '$_id.lcda',
//         parties: { 
//           $push: { party: '$_id.party', totalVotes: '$totalVotes' } 
//         },
//         grandTotal: { $sum: '$totalVotes' },
//         reportingUnits: { $addToSet: '$_id.lcda' } // Simplification for batch
//       }
//     }
//   ]);

//   // Convert array to a Map for easy frontend lookup: { [id]: data }
//   const summaryMap = {};
//   aggregation.forEach(item => {
//     summaryMap[item._id] = item;
//   });

//   res.json({ success: true, summaries: summaryMap });
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /api/results/:id  (public)
// // ─────────────────────────────────────────────────────────────────────────────
// export const getResultById = asyncHandler(async (req, res) => {
//   const result = await ElectionResult.findById(req.params.id)
//     .populate('lcda',  'name code')
//     .populate('ward',  'name code')
//     .populate('agent', 'name email');

//   if (!result) {
//     return res.status(404).json({ success: false, message: 'Result not found' });
//   }

//   return res.json({ success: true, result });
// });

// // ─────────────────────────────────────────────────────────────────────────────
// // PATCH /api/results/:id/status  (admin only)
// // ─────────────────────────────────────────────────────────────────────────────
// export const updateStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;
//   const allowed = ['pending', 'verified', 'rejected'];

//   if (!allowed.includes(status)) {
//     return res.status(400).json({ success: false, message: 'Invalid status value' });
//   }

//   const result = await ElectionResult.findByIdAndUpdate(
//     req.params.id,
//     { status },
//     { new: true, runValidators: true }
//   )
//     .populate('lcda', 'name code')
//     .populate('ward', 'name code');

//   if (!result) {
//     return res.status(404).json({ success: false, message: 'Result not found' });
//   }

//   const io = getIO(req);
//   if (io) {
//     io.to('results_room').emit('result_updated', {
//       resultId: result._id,
//       status:   result.status,
//     });
//   }

//   return res.json({ success: true, result });
// });


import mongoose from 'mongoose';
import ElectionResult from '../models/ElectionResult.js';
import Ward from '../models/Ward.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const getIO = (req) => req.app.get('io');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/results  (protected — agent only)
// Body: { ward: ObjectId, results: [{ party, votes }] }
// Agent is assigned to an LCDA; they pick the specific ward at submit time.
// ─────────────────────────────────────────────────────────────────────────────
export const submitResult = asyncHandler(async (req, res) => {
  const { results: partyVotes, ward: wardId } = req.body;
  const { _id: agentId, name: agentName, lcda } = req.user;

  if (!lcda) {
    return res.status(400).json({
      success: false,
      message: 'Your account has no LCDA assignment. Contact an administrator.',
    });
  }

  if (!wardId || !mongoose.isValidObjectId(wardId)) {
    return res.status(400).json({
      success: false,
      message: 'A valid ward ID is required.',
    });
  }

  // Ensure the selected ward actually belongs to the agent's LCDA
  const ward = await Ward.findOne({ _id: wardId, lcda });
  if (!ward) {
    return res.status(403).json({
      success: false,
      message: 'That ward does not belong to your assigned LCDA.',
    });
  }

  // One submission per ward — reject duplicates
  const existing = await ElectionResult.findOne({ ward: wardId });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'Results for this ward have already been submitted.',
    });
  }

  const result = await ElectionResult.create({
    lcda,
    ward:          wardId,
    agent:         agentId,
    agentName,
    results:       partyVotes,
    imageUrl:      req.file?.path     || null,
    imagePublicId: req.file?.filename || null,
    status:        'pending',
  });

  await result.populate('lcda',  'name code');
  await result.populate('ward',  'name code');
  await result.populate('agent', 'name email');

  const io = getIO(req);
  if (io) {
    io.to('results_room').emit('new_result', {
      result,
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(201).json({
    success: true,
    message: 'Election results submitted successfully',
    result,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results  (public)
// ─────────────────────────────────────────────────────────────────────────────
export const getResults = asyncHandler(async (req, res) => {
  const { scope, id } = req.query;
  const page  = Math.max(parseInt(req.query.page  || '1',  10), 1);
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 200);
  const skip  = (page - 1) * limit;

  const filter = {};
  if (scope === 'lcda' && id && mongoose.isValidObjectId(id)) filter.lcda = id;
  if (scope === 'ward' && id && mongoose.isValidObjectId(id)) filter.ward = id;

  const [results, total] = await Promise.all([
    ElectionResult.find(filter)
      .populate('lcda',  'name code')
      .populate('ward',  'name code')
      .populate('agent', 'name email')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ElectionResult.countDocuments(filter),
  ]);

  return res.json({ success: true, total, page, pages: Math.ceil(total / limit), results });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/summary  (public)
// ─────────────────────────────────────────────────────────────────────────────
export const getSummary = asyncHandler(async (req, res) => {
  const { scope, id } = req.query;

  const match = {};
  if (scope === 'lcda' && id && mongoose.isValidObjectId(id))
    match.lcda = new mongoose.Types.ObjectId(id);
  if (scope === 'ward' && id && mongoose.isValidObjectId(id))
    match.ward = new mongoose.Types.ObjectId(id);

  const [partyTotals, reportingUnits, recentResults] = await Promise.all([
    ElectionResult.aggregate([
      { $match: match },
      { $unwind: '$results' },
      { $group: { _id: '$results.party', totalVotes: { $sum: '$results.votes' } } },
      { $sort: { totalVotes: -1 } },
      { $project: { _id: 0, party: '$_id', totalVotes: 1 } },
    ]),
    ElectionResult.countDocuments(match),
    ElectionResult.find(match)
      .populate('lcda', 'name')
      .populate('ward', 'name')
      .sort({ submittedAt: -1 })
      .limit(5)
      .select('lcda ward agentName results totalVotes submittedAt status')
      .lean(),
  ]);

  const grandTotal = partyTotals.reduce((s, p) => s + p.totalVotes, 0);

  return res.json({ success: true, parties: partyTotals, grandTotal, reportingUnits, recent: recentResults });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/summaries/batch
// ─────────────────────────────────────────────────────────────────────────────
export const getBatchSummaries = asyncHandler(async (req, res) => {
  const { ids } = req.query;
  if (!ids) return res.status(400).json({ message: 'No IDs provided' });

  const idArray = ids.split(',').map(id => new mongoose.Types.ObjectId(id));

  const aggregation = await ElectionResult.aggregate([
    { $match: { lcda: { $in: idArray } } },
    { $unwind: '$results' },
    {
      $group: {
        _id: { lcda: '$lcda', party: '$results.party' },
        totalVotes: { $sum: '$results.votes' },
      },
    },
    {
      $group: {
        _id: '$_id.lcda',
        parties:    { $push: { party: '$_id.party', totalVotes: '$totalVotes' } },
        grandTotal: { $sum: '$totalVotes' },
      },
    },
  ]);

  const summaryMap = {};
  aggregation.forEach(item => { summaryMap[item._id] = item; });

  res.json({ success: true, summaries: summaryMap });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/results/:id  (public)
// ─────────────────────────────────────────────────────────────────────────────
export const getResultById = asyncHandler(async (req, res) => {
  const result = await ElectionResult.findById(req.params.id)
    .populate('lcda',  'name code')
    .populate('ward',  'name code')
    .populate('agent', 'name email');

  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });
  return res.json({ success: true, result });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/results/:id/status  (admin only)
// ─────────────────────────────────────────────────────────────────────────────
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
  )
    .populate('lcda', 'name code')
    .populate('ward', 'name code');

  if (!result) return res.status(404).json({ success: false, message: 'Result not found' });

  const io = getIO(req);
  if (io) {
    io.to('results_room').emit('result_updated', { resultId: result._id, status: result.status });
  }

  return res.json({ success: true, result });
});
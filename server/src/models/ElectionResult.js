// import mongoose from 'mongoose';

// // Each party entry within a result
// const partyVoteSchema = new mongoose.Schema(
//   {
//     party:  { type: String, required: true, trim: true },
//     votes:  { type: Number, required: true, min: [0, 'Votes cannot be negative'] },
//   },
//   { _id: false }
// );

// const electionResultSchema = new mongoose.Schema(
//   {
//     pollingUnit: {
//       type:     String,
//       required: [true, 'Polling unit is required'],
//       trim:     true,
//       unique:   true, // DB-level guard against duplicate submissions
//       index:    true,
//     },
//     // Agent who submitted
//     agent: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref:  'User',
//       required: true,
//     },
//     agentName: {
//       type: String,
//       required: true,
//     },
//     // Array of { party, votes } — supports multi-party results in one submission
//     results: {
//       type:     [partyVoteSchema],
//       required: true,
//       validate: {
//         validator: (arr) => arr.length > 0,
//         message:   'At least one party result is required',
//       },
//     },
//     // Optional image proof URL from Cloudinary
//     imageUrl: {
//       type:    String,
//       default: null,
//     },
//     imagePublicId: {
//       type:    String,
//       default: null,
//     },
//     status: {
//       type:    String,
//       enum:    ['pending', 'verified', 'rejected'],
//       default: 'pending',
//     },
//     // Computed total for quick sorting/filtering
//     totalVotes: {
//       type: Number,
//       default: 0,
//     },
//     submittedAt: {
//       type:    Date,
//       default: Date.now,
//     },
//   },
//   { timestamps: true }
// );

// // Compute totalVotes before every save
// electionResultSchema.pre('save', function (next) {
//   this.totalVotes = this.results.reduce((sum, r) => sum + r.votes, 0);
//   next();
// });

// // Index for efficient dashboard aggregation queries
// electionResultSchema.index({ 'results.party': 1 });
// electionResultSchema.index({ submittedAt: -1 });

// const ElectionResult = mongoose.model('ElectionResult', electionResultSchema);
// export default ElectionResult;

// models/ElectionResult.js
import mongoose from 'mongoose';

const partyVoteSchema = new mongoose.Schema(
  {
    party: { type: String, required: true, trim: true },
    votes: { type: Number, required: true, min: [0, 'Votes cannot be negative'] },
  },
  { _id: false }
);

const electionResultSchema = new mongoose.Schema(
  {
    lcda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LCDA',
      required: true,
      index: true,
    },
    ward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ward',
      required: true,
      unique: true, // one result per ward — same DB-level guard you had on pollingUnit
      index: true,
    },
    agent:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    agentName: { type: String, required: true },
    results: {
      type: [partyVoteSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'At least one party result is required',
      },
    },
    imageUrl:      { type: String, default: null },
    imagePublicId: { type: String, default: null },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    totalVotes:  { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

electionResultSchema.pre('save', function (next) {
  this.totalVotes = this.results.reduce((sum, r) => sum + r.votes, 0);
  next();
});

electionResultSchema.index({ 'results.party': 1 });
electionResultSchema.index({ submittedAt: -1 });

export default mongoose.model('ElectionResult', electionResultSchema);
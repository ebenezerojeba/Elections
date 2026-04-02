
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
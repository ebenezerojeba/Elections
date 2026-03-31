// models/Ward.js
import mongoose from 'mongoose';

const wardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    lcda: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LCDA',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index: ward names must be unique within an LCDA
wardSchema.index({ lcda: 1, name: 1 }, { unique: true });

export default mongoose.model('Ward', wardSchema);
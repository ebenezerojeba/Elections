// models/LCDA.js
import mongoose from 'mongoose';

const lcdaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    // e.g. "ALIMOSHO", "KOSOFE" — used as a stable code
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model('LCDA', lcdaSchema);
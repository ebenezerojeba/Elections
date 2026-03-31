import mongoose from 'mongoose';
import LCDA from '../models/LCDA.js';
import Ward from '../models/Ward.js';

/** GET /api/lcdas — all 57, alphabetical */
export async function getLcdas(req, res) {
  try {
    const lcdas = await LCDA.find({}).sort({ name: 1 }).lean();
    return res.json({ lcdas });
  } catch (err) {
    console.error('getLcdas:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

/** GET /api/lcdas/:id/wards — wards for one LCDA */
export async function getWardsByLcda(req, res) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid LCDA id' });
    }
    const wards = await Ward.find({ lcda: id }).sort({ name: 1 }).lean();
    return res.json({ wards });
  } catch (err) {
    console.error('getWardsByLcda:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
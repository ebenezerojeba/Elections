/**
 * scripts/reset-admin.js
 *
 * Resets (or creates) the admin user with new credentials.
 * Run: node scripts/reset-admin.js
 *
 * Set NEW_EMAIL and NEW_PASSWORD below, or pass via env:
 *   NEW_EMAIL=me@example.com NEW_PASSWORD=MyPass123 node scripts/reset-admin.js
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// ── Configure new credentials here ──────────────────────────────────────────
const NEW_EMAIL    = process.env.NEW_EMAIL    || 'admin@apc.com';
const NEW_PASSWORD = process.env.NEW_PASSWORD || 'Admin1234!';
const NEW_NAME     = process.env.NEW_NAME     || 'Super Admin';
// ─────────────────────────────────────────────────────────────────────────────

async function resetAdmin() {
  const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
  if (!uri) throw new Error('No MONGO_URI or DATABASE_URL in environment');

  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB');

  const hash = await bcrypt.hash(NEW_PASSWORD, 12);

  const result = await User.findOneAndUpdate(
    { role: 'admin' },                          // find existing admin
    {
      $set: {
        name:     NEW_NAME,
        email:    NEW_EMAIL,
        password: hash,
        role:     'admin',
      },
    },
    {
      upsert: true,        // create if no admin exists yet
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  console.log('\n─────────────────────────────────────────────────────');
  console.log('✅  Admin credentials reset successfully');
  console.log('─────────────────────────────────────────────────────');
  console.log(`  Email    : ${result.email}`);
  console.log(`  Password : ${NEW_PASSWORD}`);
  console.log(`  Name     : ${result.name}`);
  console.log(`  _id      : ${result._id}`);
  console.log('─────────────────────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('👋  Done.\n');
}

resetAdmin().catch((err) => {
  console.error('❌  Reset failed:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
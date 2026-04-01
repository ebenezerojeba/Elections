// dropIndexes.js — run once then delete
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

for (const col of ['wards', 'lcdas']) {
  const indexes = await mongoose.connection.collection(col).indexes();
  console.log(`\n${col} indexes:`, indexes.map(i => `${i.name} ${JSON.stringify(i.key)}`));

  for (const idx of indexes) {
    if (idx.name === '_id_') continue; // never drop _id
    try {
      await mongoose.connection.collection(col).dropIndex(idx.name);
      console.log(`  ✅ Dropped: ${idx.name}`);
    } catch (e) {
      console.log(`  ⚠️  ${idx.name}: ${e.message}`);
    }
  }
}

console.log('\nDone. Delete this file now.');
await mongoose.disconnect();
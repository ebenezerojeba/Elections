/**
 * Usage: node src/utils/seed.js
 * Seeds the database with sample agents and election results for dev/testing.
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ElectionResult from '../models/ElectionResult.js';

const AGENTS = [
  { name: 'Amina Yusuf',   email: 'amina@election.ng',  password: 'Agent123!', pollingUnit: 'PU-001-ABUJA' },
  { name: 'Chukwu Emeka',  email: 'chukwu@election.ng', password: 'Agent123!', pollingUnit: 'PU-002-LAGOS' },
  { name: 'Ngozi Okonkwo', email: 'ngozi@election.ng',  password: 'Agent123!', pollingUnit: 'PU-003-KANO'  },
];

const PARTIES = ['APC', 'PDP', 'LP', 'NNPP'];

const randomVotes = () => Math.floor(Math.random() * 3000) + 100;

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await ElectionResult.deleteMany({});

  const agents = await User.create(AGENTS);
  console.log(`✅ Created ${agents.length} agents`);

  const results = await ElectionResult.create(
    agents.map((agent) => ({
      pollingUnit: agent.pollingUnit,
      agent:       agent._id,
      agentName:   agent.name,
      results:     PARTIES.map((party) => ({ party, votes: randomVotes() })),
      status:      'verified',
    }))
  );
  console.log(`✅ Created ${results.length} election results`);

  await mongoose.disconnect();
  console.log('Done. Disconnected.');
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
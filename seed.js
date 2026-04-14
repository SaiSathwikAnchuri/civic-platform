/**
 * Seed Script — creates demo admin + citizen accounts
 * Run: node backend/seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config({ path: './backend/.env' });

const User = require('./backend/models/User');

const SEED_USERS = [
  {
    name: 'Admin CivicFix',
    email: 'sathwikpp14@gmail.com',
    password: 'Admin@1414',
    role: 'admin',
    phone: '9876543210',
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const u of SEED_USERS) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        await User.create(u);
        console.log(`✅ Created: ${u.email} (${u.role})`);
      } else {
        console.log(`⏭️  Already exists: ${u.email}`);
      }
    }

    console.log('\n🎉 Seed complete!');
    console.log('─────────────────────────────');
    console.log('Admin   → admin@demo.com   / admin123');
    console.log('Citizen → citizen@demo.com / demo123');
    console.log('─────────────────────────────');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();

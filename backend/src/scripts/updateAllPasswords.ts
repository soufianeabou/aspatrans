import bcrypt from 'bcryptjs';
import { query } from '../db';
import dotenv from 'dotenv';

dotenv.config();

async function updateAllPasswords() {
  const users = [
    { email: 'owner@business.ma', password: 'business123' },
    { email: 'admin@aspatrans.ma', password: 'admin123' },
    { email: 'owner@transco.ma', password: 'transco123' },
    { email: 'driver1@transco.ma', password: 'driver123' },
    { email: 'driver2@transco.ma', password: 'driver123' },
  ];

  console.log('🔄 Updating passwords for all test users...\n');

  for (const user of users) {
    try {
      const hashed = await bcrypt.hash(user.password, 10);
      await query('UPDATE users SET password = $1 WHERE email = $2', [hashed, user.email]);
      console.log(`✅ ${user.email} → password: ${user.password}`);
    } catch (e) {
      console.error(`❌ Error updating ${user.email}:`, e);
    }
  }

  console.log('\n✅ All passwords updated!');
  console.log('\n📝 Test credentials:');
  console.log('   Business: owner@business.ma / business123');
  console.log('   Admin: admin@aspatrans.ma / admin123');
  console.log('   Transport: owner@transco.ma / transco123');
  console.log('   Driver 1: driver1@transco.ma / driver123');
  console.log('   Driver 2: driver2@transco.ma / driver123');
}

updateAllPasswords()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  });


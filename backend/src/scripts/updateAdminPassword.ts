import bcrypt from 'bcryptjs';
import { query } from '../db';

async function updateAdminPassword() {
  const email = 'admin@aspatrans.ma';
  const newPassword = 'admin123';
  const hashed = await bcrypt.hash(newPassword, 10);
  
  await query('UPDATE users SET password = $1 WHERE email = $2', [hashed, email]);
  console.log(`✅ Password updated for ${email}`);
  console.log(`   New password: ${newPassword}`);
}

updateAdminPassword().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});


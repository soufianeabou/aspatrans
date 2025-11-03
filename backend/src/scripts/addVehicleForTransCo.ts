import { query } from '../db';

async function addVehicleForTransCo() {
  // Check if TransCo (company_id=1) exists
  const { rows: companies } = await query('SELECT id, name FROM transport_companies WHERE id = $1', [1]);
  
  if (companies.length === 0) {
    console.log('❌ TransCo (company_id=1) does not exist. Please run seed.sql first.');
    process.exit(1);
  }
  
  console.log(`✅ Found company: ${companies[0].name}`);
  
  // Check existing vehicles for TransCo
  const { rows: existingVehicles } = await query(
    'SELECT id, plate_number, model, status FROM vehicles WHERE company_id = $1',
    [1]
  );
  
  console.log(`\n📋 Existing vehicles for TransCo: ${existingVehicles.length}`);
  existingVehicles.forEach((v: any) => {
    console.log(`   - ${v.model} (${v.plate_number}) - status: ${v.status}`);
  });
  
  // Check if vehicle 1 exists
  const { rows: vehicle1 } = await query('SELECT * FROM vehicles WHERE id = $1', [1]);
  
  if (vehicle1.length > 0) {
    console.log(`\n✅ Vehicle 1 already exists: ${vehicle1[0].model} (${vehicle1[0].plate_number})`);
    console.log(`   Status: ${vehicle1[0].status}`);
    console.log(`   Company ID: ${vehicle1[0].company_id}`);
    
    if (vehicle1[0].company_id !== 1) {
      console.log(`\n⚠️  Vehicle 1 belongs to company_id ${vehicle1[0].company_id}, not TransCo (1). Updating...`);
      await query('UPDATE vehicles SET company_id = $1 WHERE id = $2', [1, 1]);
      console.log('✅ Vehicle 1 updated to belong to TransCo');
    }
    
    if (vehicle1[0].status !== 'active') {
      console.log(`\n⚠️  Vehicle 1 status is '${vehicle1[0].status}', setting to 'active'...`);
      await query('UPDATE vehicles SET status = $1 WHERE id = $2', ['active', 1]);
      console.log('✅ Vehicle 1 status updated to active');
    }
  } else {
    console.log('\n❌ Vehicle 1 does not exist. Creating...');
    await query(
      'INSERT INTO vehicles (id, company_id, plate_number, model, capacity, status, last_maintenance) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [1, 1, 'A-123456', 'Renault Master', 1500, 'active', '2025-06-01']
    );
    console.log('✅ Vehicle 1 created for TransCo');
  }
  
  // Verify
  const { rows: finalVehicles } = await query(
    'SELECT id, plate_number, model, status FROM vehicles WHERE company_id = $1 AND status IN ($2, $3)',
    [1, 'active', 'pending']
  );
  
  console.log(`\n✅ Final vehicles for TransCo (active/pending): ${finalVehicles.length}`);
  finalVehicles.forEach((v: any) => {
    console.log(`   - ${v.model} (${v.plate_number}) - status: ${v.status}`);
  });
  
  console.log('\n✅ Done!');
}

addVehicleForTransCo().then(() => process.exit(0)).catch(e => {
  console.error('❌ Error:', e);
  process.exit(1);
});


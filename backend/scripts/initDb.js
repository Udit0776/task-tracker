const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function initDb() {
  console.log('🚀 Starting Database Initialization...');

  try {
    // 1. Read the schema.sql file
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // 2. Execute schema DDL
    console.log('⌛ Creating database tables and indices...');
    await pool.query(schemaSql);
    console.log('✅ Tables and indices created successfully.');

    // 3. Seed Tenants
    console.log('⌛ Seeding Tenants...');
    const tenantAcmeRes = await pool.query(
      `INSERT INTO tenants (name) VALUES ('Acme Corp') RETURNING id`
    );
    const acmeTenantId = tenantAcmeRes.rows[0].id;

    const tenantStarkRes = await pool.query(
      `INSERT INTO tenants (name) VALUES ('Stark Industries') RETURNING id`
    );
    const starkTenantId = tenantStarkRes.rows[0].id;

    console.log(`✅ Seeded Tenants:\n   - Acme Corp ID: ${acmeTenantId}\n   - Stark Industries ID: ${starkTenantId}`);

    // 4. Hash Passwords
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const managerPasswordHash = await bcrypt.hash('manager123', 10);
    const memberPasswordHash = await bcrypt.hash('member123', 10);

    // 5. Seed Users for Acme Corp
    console.log('⌛ Seeding Users for Acme Corp...');
    const acmeAdminRes = await pool.query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role) 
       VALUES ($1, 'Acme Admin', 'admin@acme.com', $2, 'ADMIN') RETURNING id`,
      [acmeTenantId, adminPasswordHash]
    );
    const acmeAdminId = acmeAdminRes.rows[0].id;

    const acmeManagerRes = await pool.query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role) 
       VALUES ($1, 'Acme Manager', 'manager@acme.com', $2, 'MANAGER') RETURNING id`,
      [acmeTenantId, managerPasswordHash]
    );
    const acmeManagerId = acmeManagerRes.rows[0].id;

    const acmeMemberRes = await pool.query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role) 
       VALUES ($1, 'Acme Member', 'member@acme.com', $2, 'MEMBER') RETURNING id`,
      [acmeTenantId, memberPasswordHash]
    );
    const acmeMemberId = acmeMemberRes.rows[0].id;

    // 6. Seed Users for Stark Industries
    console.log('⌛ Seeding Users for Stark Industries...');
    const starkAdminRes = await pool.query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role) 
       VALUES ($1, 'Tony Stark', 'admin@stark.com', $2, 'ADMIN') RETURNING id`,
      [starkTenantId, adminPasswordHash]
    );
    const starkAdminId = starkAdminRes.rows[0].id;

    const starkMemberRes = await pool.query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role) 
       VALUES ($1, 'Peter Parker', 'member@stark.com', $2, 'MEMBER') RETURNING id`,
      [starkTenantId, memberPasswordHash]
    );
    const starkMemberId = starkMemberRes.rows[0].id;

    console.log('✅ Seeded Users successfully.');

    // 7. Seed Tasks for Acme Corp
    console.log('⌛ Seeding Tasks for Acme Corp...');
    const acmeTask1Res = await pool.query(
      `INSERT INTO tasks (tenant_id, title, description, priority, status, due_date, created_by_id, assigned_to_id)
       VALUES ($1, 'Design Database Architecture', 'Create schema.sql and seed script with multi-tenancy support', 'HIGH', 'DONE', NOW() + INTERVAL '2 days', $2, $3)
       RETURNING id`,
      [acmeTenantId, acmeManagerId, acmeMemberId]
    );
    const acmeTask1Id = acmeTask1Res.rows[0].id;

    await pool.query(
      `INSERT INTO tasks (tenant_id, title, description, priority, status, due_date, created_by_id, assigned_to_id)
       VALUES ($1, 'Build Authentication API', 'Implement JWT auth, signup, and login flow with tenant identification', 'HIGH', 'IN_PROGRESS', NOW() + INTERVAL '4 days', $2, $3)`,
      [acmeTenantId, acmeManagerId, acmeMemberId]
    );

    await pool.query(
      `INSERT INTO tasks (tenant_id, title, description, priority, status, due_date, created_by_id, assigned_to_id)
       VALUES ($1, 'Prepare Frontend Boilerplate', 'Initialize React application and set up basic Router structure', 'MEDIUM', 'TODO', NOW() + INTERVAL '7 days', $2, $3)`,
      [acmeTenantId, acmeAdminId, acmeMemberId]
    );

    // 8. Seed Tasks for Stark Industries (for isolating proof)
    console.log('⌛ Seeding Tasks for Stark Industries...');
    const starkTask1Res = await pool.query(
      `INSERT INTO tasks (tenant_id, title, description, priority, status, due_date, created_by_id, assigned_to_id)
       VALUES ($1, 'Upgrade Iron Man Armor', 'Incorporate nanotech enhancements into Mark 85', 'HIGH', 'IN_PROGRESS', NOW() + INTERVAL '1 day', $2, $3)
       RETURNING id`,
      [starkTenantId, starkAdminId, starkMemberId]
    );
    const starkTask1Id = starkTask1Res.rows[0].id;

    console.log('✅ Seeded Tasks successfully.');

    // 9. Seed Comments
    console.log('⌛ Seeding Comments...');
    await pool.query(
      `INSERT INTO comments (tenant_id, task_id, message, created_by_id)
       VALUES ($1, $2, 'Database architecture design is completed. Added strict tenant foreign keys.', $3)`,
      [acmeTenantId, acmeTask1Id, acmeMemberId]
    );

    await pool.query(
      `INSERT INTO comments (tenant_id, task_id, message, created_by_id)
       VALUES ($1, $2, 'Nanotech upgrade is looking extremely stable. Added to the suit framework.', $3)`,
      [starkTenantId, starkTask1Id, starkMemberId]
    );

    console.log('✅ Seeded Comments successfully.');
    console.log('🎉 Database Initialized & Seeded Successfully!');
  } catch (error) {
    console.error('❌ Database Initialization Failed:', error);
  } finally {
    await pool.end();
  }
}

// Run script if called directly
if (require.main === module) {
  initDb();
}

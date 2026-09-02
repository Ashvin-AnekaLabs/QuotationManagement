require('dotenv').config();
const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('Beginning database seed...');
    await client.query('BEGIN');

    // 1. Run Schema Updates (to ensure tables exist)
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await client.query(schemaSql);
    console.log('✅ Schema updated');

    // 2. Insert Modules
    const modules = [
      { code: 'DASHBOARD', name: 'Dashboard' },
      { code: 'QUOTATIONS', name: 'Quotations' },
      { code: 'PROPOSALS', name: 'Proposals' },
      { code: 'CLIENTS', name: 'Clients' },
      { code: 'EMPLOYEES', name: 'Employees' },
      { code: 'SCOPE_LIBRARY', name: 'Scope Library' },
      { code: 'STANDARD_CLAUSES', name: 'Standard Clauses' },
      { code: 'CURRENCY_MASTER', name: 'Currency Master' },
      { code: 'TEMPLATES', name: 'Templates' },
      { code: 'MASTERS', name: 'Masters' },
      { code: 'REPORTS', name: 'Reports' },
      { code: 'APPROVALS', name: 'Approvals' },
      { code: 'ROLE_MANAGEMENT', name: 'Role Management' },
      { code: 'SETTINGS', name: 'Settings' }
    ];

    for (const m of modules) {
      await client.query(`
        INSERT INTO "tblModules" (code, name, status) 
        VALUES ($1, $2, true) 
        ON CONFLICT (code) DO NOTHING
      `, [m.code, m.name]);
    }
    console.log('✅ Modules seeded');

    // 3. Insert Roles
    const roles = ['Admin', 'Manager', 'Sales Person'];
    for (const r of roles) {
      await client.query(`
        INSERT INTO "tblRoles" (name) 
        VALUES ($1) 
        ON CONFLICT (name) DO NOTHING
      `, [r]);
    }
    console.log('✅ Roles seeded');

    // 4. Create Accounts
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123';
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const accounts = [
      { name: 'System Admin', email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@quotemaster.com', role: 'Admin' },
      { name: 'Manager Account', email: 'manager@quotemaster.com', role: 'Manager' },
      { name: 'Sales Account', email: 'sales@quotemaster.com', role: 'Sales Person' }
    ];

    for (const acc of accounts) {
      // Find role_id
      const roleRes = await client.query(`SELECT id FROM "tblRoles" WHERE name = $1`, [acc.role]);
      const role_id = roleRes.rows[0].id;

      // Insert Employee (if not exists)
      let emp_id;
      const existingEmp = await client.query(`SELECT id FROM "tblEmployees" WHERE email = $1`, [acc.email]);
      if (existingEmp.rows.length > 0) {
        emp_id = existingEmp.rows[0].id;
      } else {
        const empRes = await client.query(`
          INSERT INTO "tblEmployees" (name, email, role, hourly_rate, designation, department)
          VALUES ($1, $2, $3, 0, $3, 'Default') RETURNING id
        `, [acc.name, acc.email, acc.role]);
        emp_id = empRes.rows[0].id;
      }

      // Insert User (if not exists)
      const existingUser = await client.query(`SELECT id FROM "tblUsers" WHERE email = $1`, [acc.email]);
      if (existingUser.rows.length === 0) {
        await client.query(`
          INSERT INTO "tblUsers" (employee_id, role_id, email, password_hash, is_active, must_change_password)
          VALUES ($1, $2, $3, $4, true, true)
        `, [emp_id, role_id, acc.email, passwordHash]);
      }
    }
    console.log('✅ Accounts seeded');

    // 5. Assign default Privileges to Manager and Sales Person
    // (Admin bypasses privileges so we don't need to seed them, or we could just skip)
    const modulesRes = await client.query(`SELECT id, code FROM "tblModules"`);
    const allModules = modulesRes.rows;

    const managerRoleRes = await client.query(`SELECT id FROM "tblRoles" WHERE name = 'Manager'`);
    const managerRoleId = managerRoleRes.rows[0].id;

    const salesRoleRes = await client.query(`SELECT id FROM "tblRoles" WHERE name = 'Sales Person'`);
    const salesRoleId = salesRoleRes.rows[0].id;

    // Define some sensible defaults
    for (const m of allModules) {
      let mView = true, mAdd = true, mEdit = true, mDel = false, mExp = true; // Default Manager
      let sView = true, sAdd = true, sEdit = false, sDel = false, sExp = false; // Default Sales

      if (m.code === 'ROLE_MANAGEMENT' || m.code === 'SETTINGS' || m.code === 'MASTERS') {
        mView = false; mAdd = false; mEdit = false; mDel = false; mExp = false;
        sView = false; sAdd = false; sEdit = false; sDel = false; sExp = false;
      }

      if (m.code === 'QUOTATIONS') {
        sEdit = true; // Sales can edit quotations
      }

      // Manager Privileges
      await client.query(`
        INSERT INTO "tblRolePrivileges" (role_id, module_id, can_view, can_add, can_edit, can_delete, can_export)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (role_id, module_id) DO UPDATE 
        SET can_view = EXCLUDED.can_view,
            can_add = EXCLUDED.can_add,
            can_edit = EXCLUDED.can_edit,
            can_delete = EXCLUDED.can_delete,
            can_export = EXCLUDED.can_export
      `, [managerRoleId, m.id, mView, mAdd, mEdit, mDel, mExp]);

      // Sales Privileges
      await client.query(`
        INSERT INTO "tblRolePrivileges" (role_id, module_id, can_view, can_add, can_edit, can_delete, can_export)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (role_id, module_id) DO UPDATE 
        SET can_view = EXCLUDED.can_view,
            can_add = EXCLUDED.can_add,
            can_edit = EXCLUDED.can_edit,
            can_delete = EXCLUDED.can_delete,
            can_export = EXCLUDED.can_export
      `, [salesRoleId, m.id, sView, sAdd, sEdit, sDel, sExp]);
    }
    console.log('✅ Default Privileges seeded for Manager and Sales Person');

    await client.query('COMMIT');
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

runSeed();

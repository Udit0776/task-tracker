const { query } = require('../config/db');

class UserRepository {
  async create({ tenantId, name, email, passwordHash, role }) {
    const res = await query(
      `INSERT INTO users (tenant_id, name, email, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, tenant_id, name, email, role, created_at`,
      [tenantId, name, email, passwordHash, role]
    );
    return res.rows[0];
  }

  async findByEmail(email) {
    const res = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );
    return res.rows[0] || null;
  }

  async findById(id, tenantId) {
    const res = await query(
      `SELECT id, tenant_id, name, email, role, created_at 
       FROM users 
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    return res.rows[0] || null;
  }

  async findAllInTenant(tenantId) {
    const res = await query(
      `SELECT id, name, email, role, created_at 
       FROM users 
       WHERE tenant_id = $1 
       ORDER BY created_at DESC`,
      [tenantId]
    );
    return res.rows;
  }

  async updateRole(id, role, tenantId) {
    const res = await query(
      `UPDATE users 
       SET role = $1 
       WHERE id = $2 AND tenant_id = $3 
       RETURNING id, tenant_id, name, email, role`,
      [role, id, tenantId]
    );
    return res.rows[0] || null;
  }
}

module.exports = new UserRepository();

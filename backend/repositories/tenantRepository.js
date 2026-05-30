const { query } = require('../config/db');

class TenantRepository {
  async create(name) {
    const res = await query(
      'INSERT INTO tenants (name) VALUES ($1) RETURNING *',
      [name]
    );
    return res.rows[0];
  }

  async findById(id) {
    const res = await query(
      'SELECT * FROM tenants WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }
}

module.exports = new TenantRepository();

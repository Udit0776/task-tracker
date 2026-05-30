const { query } = require('../config/db');

class TaskRepository {
  async create({ tenantId, title, description, priority, status, dueDate, createdById, assignedToId }) {
    const res = await query(
      `INSERT INTO tasks (tenant_id, title, description, priority, status, due_date, created_by_id, assigned_to_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tenantId, title, description, priority, status, dueDate, createdById, assignedToId]
    );
    return res.rows[0];
  }

  async findById(id, tenantId) {
    const res = await query(
      `SELECT t.*, 
              u_creator.name as creator_name, u_creator.email as creator_email,
              u_assignee.name as assignee_name, u_assignee.email as assignee_email
       FROM tasks t
       LEFT JOIN users u_creator ON t.created_by_id = u_creator.id
       LEFT JOIN users u_assignee ON t.assigned_to_id = u_assignee.id
       WHERE t.id = $1 AND t.tenant_id = $2`,
      [id, tenantId]
    );
    return res.rows[0] || null;
  }

  async findAll({ tenantId, status, priority, assignedToId, role, userId }) {
    let sql = `
      SELECT t.*, 
             u_creator.name as creator_name,
             u_assignee.name as assignee_name
      FROM tasks t
      LEFT JOIN users u_creator ON t.created_by_id = u_creator.id
      LEFT JOIN users u_assignee ON t.assigned_to_id = u_assignee.id
      WHERE t.tenant_id = $1
    `;
    const params = [tenantId];
    let paramIndex = 2;

    // Apply basic filter parameters
    if (status) {
      sql += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (priority) {
      sql += ` AND t.priority = $${paramIndex}`;
      params.push(priority);
      paramIndex++;
    }

    if (assignedToId) {
      sql += ` AND t.assigned_to_id = $${paramIndex}`;
      params.push(assignedToId);
      paramIndex++;
    }

    // Role-based visibility scoping:
    // "Member Can view tasks assigned to them"
    // Manager and Admin can view all tasks within the tenant scope
    if (role === 'MEMBER') {
      sql += ` AND t.assigned_to_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    sql += ` ORDER BY t.created_at DESC`;

    const res = await query(sql, params);
    return res.rows;
  }

  async update(id, tenantId, updates) {
    const fields = [];
    const params = [id, tenantId];
    let paramIndex = 3;

    // Mapping from database columns to potential JS keys in updates
    const fieldMapping = {
      title: ['title'],
      description: ['description'],
      priority: ['priority'],
      status: ['status'],
      due_date: ['due_date', 'dueDate'],
      assigned_to_id: ['assigned_to_id', 'assignedToId']
    };
    
    for (const [dbCol, jsKeys] of Object.entries(fieldMapping)) {
      const matchingKey = jsKeys.find(k => updates[k] !== undefined);
      if (matchingKey !== undefined) {
        fields.push(`${dbCol} = $${paramIndex}`);
        params.push(updates[matchingKey]);
        paramIndex++;
      }
    }

    if (fields.length === 0) return null;

    params.push(new Date()); // For updated_at field
    fields.push(`updated_at = $${paramIndex}`);

    const sql = `
      UPDATE tasks 
      SET ${fields.join(', ')} 
      WHERE id = $1 AND tenant_id = $2 
      RETURNING *
    `;

    const res = await query(sql, params);
    return res.rows[0] || null;
  }

  async delete(id, tenantId) {
    const res = await query(
      'DELETE FROM tasks WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [id, tenantId]
    );
    return res.rows.length > 0;
  }
}

module.exports = new TaskRepository();

const { query } = require('../config/db');

class CommentRepository {
  async create({ tenantId, taskId, message, createdById }) {
    const res = await query(
      `INSERT INTO comments (tenant_id, task_id, message, created_by_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tenantId, taskId, message, createdById]
    );
    return res.rows[0];
  }

  async findAllByTaskId(taskId, tenantId) {
    const res = await query(
      `SELECT c.*, u.name as creator_name, u.email as creator_email
       FROM comments c
       LEFT JOIN users u ON c.created_by_id = u.id
       WHERE c.task_id = $1 AND c.tenant_id = $2
       ORDER BY c.created_at ASC`,
      [taskId, tenantId]
    );
    return res.rows;
  }
}

module.exports = new CommentRepository();

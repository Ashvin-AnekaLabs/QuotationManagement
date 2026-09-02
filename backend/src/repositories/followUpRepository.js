const BaseRepository = require('./baseRepository');

class FollowUpRepository extends BaseRepository {
  async create(data, client = null) {
    const {
      quotation_id,
      follow_up_type,
      contact_person,
      date_time,
      purpose,
      discussion_notes,
      discussion_tags,
      next_action,
      next_follow_up_date,
      assigned_to
    } = data;

    const sql = `
      INSERT INTO "tblQuotationFollowUps" (
        quotation_id, follow_up_type, contact_person, date_time, purpose,
        discussion_notes, discussion_tags, next_action, next_follow_up_date, assigned_to
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    
    // tags is jsonb, we can just pass the JS object/array or stringify
    const tagsValue = Array.isArray(discussion_tags) ? JSON.stringify(discussion_tags) : null;
    
    // Parse assigned_to safely (handle "0", 0, "", null, undefined)
    const parsedAssignedTo = parseInt(assigned_to, 10);
    const validAssignedTo = !isNaN(parsedAssignedTo) && parsedAssignedTo > 0 ? parsedAssignedTo : null;

    const result = await this.query(
      sql,
      [
        quotation_id,
        follow_up_type,
        contact_person,
        date_time,
        purpose,
        discussion_notes,
        tagsValue,
        next_action,
        next_follow_up_date || null,
        validAssignedTo
      ],
      client
    );
    return result.rows[0];
  }

  async findByQuotationId(quotation_id, client = null) {
    const sql = `
      SELECT f.*, e.name AS assigned_to_name
      FROM "tblQuotationFollowUps" f
      LEFT JOIN "tblEmployees" e ON f.assigned_to = e.id
      WHERE f.quotation_id = $1
      ORDER BY f.date_time DESC;
    `;
    const result = await this.query(sql, [quotation_id], client);
    return result.rows;
  }
}

module.exports = new FollowUpRepository();

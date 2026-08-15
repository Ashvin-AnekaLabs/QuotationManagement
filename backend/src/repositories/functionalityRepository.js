const BaseRepository = require('./baseRepository');

const formatFunctionality = (f) => {
  if (!f) return null;
  const funcTitle = f.title || f.functionality || f.module || '';
  return {
    id: f.id,
    scope_id: f.scope_id,
    module: f.module || '',
    title: funcTitle,
    functionality: funcTitle,
    description: f.description || '',
    category: f.category || 'Core',
    priority: f.priority || 'Medium',
    est_hours: parseFloat(f.est_hours || 0),
    est_days: parseFloat(f.est_days || 0),
    timeline_days: parseInt(f.timeline_days || f.est_days || 0, 10),
    rate_per_hour: parseFloat(f.rate_per_hour || 0),
    effort_cost: parseFloat(f.effort_cost || 0),
    complexity: f.complexity || 'Medium',
    sort_order: parseInt(f.sort_order || 0, 10),
    created_at: f.created_at,
    updated_at: f.updated_at,
  };
};

class FunctionalityRepository extends BaseRepository {
  async create(data, client = null) {
    const {
      scope_id,
      module,
      module_name,
      title,
      functionality,
      description,
      category = 'Core',
      priority = 'Medium',
      est_hours = 0,
      est_days = 0,
      timeline_days,
      rate_per_hour = 0,
      effort_cost,
      complexity = 'Medium',
      sort_order = 0,
    } = data;

    const actualModule = module || module_name || '';
    const actualTitle = title || functionality || actualModule;
    const computedEstDays = est_days || timeline_days || Math.ceil((est_hours || 0) / 8);
    const computedTimelineDays = Math.ceil(parseFloat(timeline_days || computedEstDays || 0));
    const computedCost = effort_cost !== undefined ? effort_cost : (est_hours || 0) * (rate_per_hour || 0);

    const sql = `
      INSERT INTO "tblQuotationFunctionalities" (
        scope_id, module, title, description, category, priority,
        est_hours, est_days, timeline_days, rate_per_hour, effort_cost, complexity, sort_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [
        scope_id,
        actualModule,
        actualTitle,
        description || null,
        category,
        priority,
        est_hours,
        computedEstDays,
        computedTimelineDays,
        rate_per_hour,
        computedCost,
        complexity,
        sort_order,
      ],
      client
    );
    return formatFunctionality(result.rows[0]);
  }

  async findByScopeId(scope_id, client = null) {
    const sql = `
      SELECT * FROM "tblQuotationFunctionalities"
      WHERE scope_id = $1
      ORDER BY sort_order ASC, id ASC;
    `;
    const result = await this.query(sql, [scope_id], client);
    return result.rows.map(formatFunctionality);
  }

  async findAll({ limit = 50, offset = 0 } = {}, client = null) {
    const sql = `
      SELECT * FROM "tblQuotationFunctionalities"
      ORDER BY id DESC
      LIMIT $1 OFFSET $2;
    `;
    const result = await this.query(sql, [limit, offset], client);
    return result.rows.map(formatFunctionality);
  }

  async findById(id, client = null) {
    const sql = `
      SELECT f.*, s.quotation_id
      FROM "tblQuotationFunctionalities" f
      JOIN "tblQuotationScopes" s ON f.scope_id = s.id
      WHERE f.id = $1;
    `;
    const result = await this.query(sql, [id], client);
    return formatFunctionality(result.rows[0]);
  }

  async update(id, data, client = null) {
    const {
      module,
      module_name,
      title,
      functionality,
      description,
      category,
      priority,
      est_hours,
      est_days,
      timeline_days,
      rate_per_hour,
      effort_cost,
      complexity,
      sort_order,
    } = data;

    const actualModule = module || module_name;
    const actualTitle = title || functionality;

    const sql = `
      UPDATE "tblQuotationFunctionalities"
      SET module = COALESCE($1, module),
          title = COALESCE($2, title),
          description = COALESCE($3, description),
          category = COALESCE($4, category),
          priority = COALESCE($5, priority),
          est_hours = COALESCE($6, est_hours),
          est_days = COALESCE($7, est_days),
          timeline_days = COALESCE($8, timeline_days),
          rate_per_hour = COALESCE($9, rate_per_hour),
          effort_cost = COALESCE($10, effort_cost),
          complexity = COALESCE($11, complexity),
          sort_order = COALESCE($12, sort_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [
        actualModule,
        actualTitle,
        description,
        category,
        priority,
        est_hours,
        est_days,
        timeline_days,
        rate_per_hour,
        effort_cost,
        complexity,
        sort_order,
        id,
      ],
      client
    );
    return formatFunctionality(result.rows[0]);
  }

  async delete(id, client = null) {
    const sql = `DELETE FROM "tblQuotationFunctionalities" WHERE id = $1 RETURNING *;`;
    const result = await this.query(sql, [id], client);
    return formatFunctionality(result.rows[0]);
  }

  /**
   * Calculate Total Timeline Days & Total Effort Hours for a given Quotation ID
   */
  async calculateQuotationTimeline(quotation_id, client = null) {
    const sql = `
      SELECT 
        (
          COALESCE((SELECT SUM(GREATEST(s.timeline_days, s.est_days)) FROM "tblQuotationScopes" s WHERE s.quotation_id = $1), 0)
        ) AS total_timeline,
        (
          COALESCE((SELECT SUM(s.est_hours) FROM "tblQuotationScopes" s WHERE s.quotation_id = $1), 0)
        ) AS total_hours,
        (
          COALESCE((SELECT SUM(s.effort_cost) FROM "tblQuotationScopes" s WHERE s.quotation_id = $1), 0)
        ) AS total_cost;
    `;
    const result = await this.query(sql, [quotation_id], client);
    return {
      total_timeline: parseInt(result.rows[0].total_timeline, 10),
      total_hours: parseFloat(result.rows[0].total_hours),
      total_cost: parseFloat(result.rows[0].total_cost),
    };
  }
}

module.exports = new FunctionalityRepository();


const BaseRepository = require('./baseRepository');

const formatScope = (s) => {
  if (!s) return null;
  const scopeTitle = s.title || s.module || '';
  const scopeSubtext = s.subtext || s.module_subtext || '';
  return {
    id: s.id,
    quotation_id: s.quotation_id,
    module: s.module || '',
    title: scopeTitle,
    subtext: scopeSubtext,
    module_subtext: scopeSubtext,
    description: s.description || '',
    category: s.category || 'Core',
    priority: s.priority || 'Medium',
    est_hours: parseFloat(s.est_hours || 0),
    est_days: parseFloat(s.est_days || 0),
    timeline_days: parseInt(s.timeline_days || s.est_days || 0, 10),
    rate_per_hour: parseFloat(s.rate_per_hour || 0),
    effort_cost: parseFloat(s.effort_cost || 0),
    complexity: s.complexity || 'Medium',
    sort_order: parseInt(s.sort_order || 0, 10),
    created_at: s.created_at,
    updated_at: s.updated_at,
  };
};

class ScopeRepository extends BaseRepository {
  async create(data, client = null) {
    const {
      quotation_id,
      module,
      module_name,
      title,
      subtext,
      module_subtext,
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
    const actualTitle = title || actualModule || 'New Scope';
    const actualSubtext = subtext || module_subtext || '';
    const computedEstDays = est_days || timeline_days || Math.ceil((est_hours || 0) / 8);
    const computedTimelineDays = Math.ceil(parseFloat(timeline_days || computedEstDays || 0));
    const computedCost = effort_cost !== undefined ? effort_cost : (est_hours || 0) * (rate_per_hour || 0);

    const sql = `
      INSERT INTO "tblQuotationScopes" (
        quotation_id, module, title, subtext, module_subtext, description, category, priority,
        est_hours, est_days, timeline_days, rate_per_hour, effort_cost, complexity, sort_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [
        quotation_id,
        actualModule,
        actualTitle,
        actualSubtext,
        actualSubtext,
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
    return formatScope(result.rows[0]);
  }

  async findByQuotationId(quotation_id, client = null) {
    const sql = `
      SELECT * FROM "tblQuotationScopes"
      WHERE quotation_id = $1
      ORDER BY COALESCE(sort_order, id) ASC, id ASC;
    `;
    const result = await this.query(sql, [quotation_id], client);
    return result.rows.map(formatScope);
  }

  async findAll({ limit = 50, offset = 0 } = {}, client = null) {
    const sql = `
      SELECT * FROM "tblQuotationScopes"
      ORDER BY id DESC
      LIMIT $1 OFFSET $2;
    `;
    const result = await this.query(sql, [limit, offset], client);
    return result.rows.map(formatScope);
  }

  async findById(id, client = null) {
    const sql = `SELECT * FROM "tblQuotationScopes" WHERE id = $1;`;
    const result = await this.query(sql, [id], client);
    return formatScope(result.rows[0]);
  }

  async update(id, data, client = null) {
    const {
      module,
      module_name,
      title,
      subtext,
      module_subtext,
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
    const actualTitle = title;
    const actualSubtext = subtext || module_subtext;

    const sql = `
      UPDATE "tblQuotationScopes"
      SET module = COALESCE($1, module),
          title = COALESCE($2, title),
          subtext = COALESCE($3, subtext),
          module_subtext = COALESCE($4, module_subtext),
          description = COALESCE($5, description),
          category = COALESCE($6, category),
          priority = COALESCE($7, priority),
          est_hours = COALESCE($8, est_hours),
          est_days = COALESCE($9, est_days),
          timeline_days = COALESCE($10, timeline_days),
          rate_per_hour = COALESCE($11, rate_per_hour),
          effort_cost = COALESCE($12, effort_cost),
          complexity = COALESCE($13, complexity),
          sort_order = COALESCE($14, sort_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [
        actualModule,
        actualTitle,
        actualSubtext,
        actualSubtext,
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
    return formatScope(result.rows[0]);
  }

  async delete(id, client = null) {
    const sql = `DELETE FROM "tblQuotationScopes" WHERE id = $1 RETURNING *;`;
    const result = await this.query(sql, [id], client);
    return formatScope(result.rows[0]);
  }
}

module.exports = new ScopeRepository();

const BaseRepository = require('./baseRepository');

const formatDateString = (dateVal) => {
  if (!dateVal) return null;
  if (dateVal instanceof Date) {
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, '0');
    const day = String(dateVal.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof dateVal === 'string') {
    return dateVal.split('T')[0];
  }
  return dateVal;
};

const formatMilestone = (m) => {
  if (!m) return null;
  
  const startDate = formatDateString(m.start_date);
  const endDate = formatDateString(m.end_date);
  
  let durationDays = parseInt(m.duration_days || 0, 10);
  if ((!durationDays || durationDays <= 0) && startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (!isNaN(diffTime) && diffTime >= 0) {
      durationDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  return {
    ...m,
    start_date: startDate,
    end_date: endDate,
    duration_days: durationDays,
    sort_order: parseInt(m.sort_order || 0, 10),
  };
};

class MilestoneRepository extends BaseRepository {
  async create({ quotation_id, milestone_name, milestone_subtext, start_date, end_date, duration_days, sort_order }, client = null) {
    const sDate = formatDateString(start_date);
    const eDate = formatDateString(end_date);

    let computedDuration = parseInt(duration_days || 0, 10);
    if ((!computedDuration || computedDuration <= 0) && sDate && eDate) {
      const s = new Date(sDate);
      const e = new Date(eDate);
      const diff = e.getTime() - s.getTime();
      if (!isNaN(diff) && diff >= 0) {
        computedDuration = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
      }
    }

    const sql = `
      INSERT INTO "tblQuotationMilestones" (
        quotation_id, milestone_name, milestone_subtext, start_date, end_date, duration_days, sort_order
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [
        quotation_id,
        milestone_name,
        milestone_subtext || null,
        sDate || null,
        eDate || null,
        computedDuration || 0,
        sort_order || 0,
      ],
      client
    );
    return formatMilestone(result.rows[0]);
  }

  async findByQuotationId(quotation_id, client = null) {
    const sql = `
      SELECT * FROM "tblQuotationMilestones"
      WHERE quotation_id = $1
      ORDER BY sort_order ASC, id ASC;
    `;
    const result = await this.query(sql, [quotation_id], client);
    return result.rows.map(formatMilestone);
  }

  async findById(id, client = null) {
    const sql = `SELECT * FROM "tblQuotationMilestones" WHERE id = $1;`;
    const result = await this.query(sql, [id], client);
    return formatMilestone(result.rows[0]);
  }

  async update(id, { milestone_name, milestone_subtext, start_date, end_date, duration_days, sort_order }, client = null) {
    const sDate = start_date !== undefined ? formatDateString(start_date) : undefined;
    const eDate = end_date !== undefined ? formatDateString(end_date) : undefined;

    let computedDuration = duration_days !== undefined ? parseInt(duration_days, 10) : undefined;

    if ((computedDuration === undefined || computedDuration <= 0) && (sDate || eDate)) {
      const existing = await this.findById(id, client);
      if (existing) {
        const finalStart = sDate !== undefined ? sDate : existing.start_date;
        const finalEnd = eDate !== undefined ? eDate : existing.end_date;
        if (finalStart && finalEnd) {
          const s = new Date(finalStart);
          const e = new Date(finalEnd);
          const diff = e.getTime() - s.getTime();
          if (!isNaN(diff) && diff >= 0) {
            computedDuration = Math.round(diff / (1000 * 60 * 60 * 24)) + 1;
          }
        }
      }
    }

    const sql = `
      UPDATE "tblQuotationMilestones"
      SET milestone_name = COALESCE($1, milestone_name),
          milestone_subtext = COALESCE($2, milestone_subtext),
          start_date = COALESCE($3, start_date),
          end_date = COALESCE($4, end_date),
          duration_days = COALESCE($5, duration_days),
          sort_order = COALESCE($6, sort_order),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [
        milestone_name,
        milestone_subtext,
        sDate,
        eDate,
        computedDuration,
        sort_order,
        id,
      ],
      client
    );
    return formatMilestone(result.rows[0]);
  }

  async delete(id, client = null) {
    const sql = `DELETE FROM "tblQuotationMilestones" WHERE id = $1 RETURNING *;`;
    const result = await this.query(sql, [id], client);
    return formatMilestone(result.rows[0]);
  }

  async bulkSave(quotation_id, milestones = [], client = null) {
    await this.query(`DELETE FROM "tblQuotationMilestones" WHERE quotation_id = $1;`, [quotation_id], client);

    if (!Array.isArray(milestones) || milestones.length === 0) {
      return [];
    }

    const saved = [];
    for (let i = 0; i < milestones.length; i++) {
      const m = milestones[i];
      if (!m || typeof m !== 'object') continue;
      const name = (m.milestone_name || m.name || m.title || '').trim();

      // Skip empty placeholder entries if no name and no date exists
      if (!name && !m.start_date && !m.end_date && !m.milestone_subtext) continue;

      const created = await this.create(
        {
          quotation_id,
          milestone_name: name || `Milestone ${i + 1}`,
          milestone_subtext: m.milestone_subtext || m.subtext || null,
          start_date: m.start_date || null,
          end_date: m.end_date || null,
          duration_days: m.duration_days || 0,
          sort_order: m.sort_order !== undefined ? m.sort_order : i + 1,
        },
        client
      );
      saved.push(created);
    }
    return saved;
  }
}

module.exports = new MilestoneRepository();

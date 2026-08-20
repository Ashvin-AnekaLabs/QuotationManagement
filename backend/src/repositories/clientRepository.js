const BaseRepository = require('./baseRepository');

const formatClient = (c) => {
  if (!c) return null;
  const contactPerson = c.contact_person || c.name || '';
  return {
    ...c,
    contact_person: contactPerson,
    name: contactPerson,
    currency: c.currency || 'INR',
    status: c.status || 'ACTIVE',
  };
};

class ClientRepository extends BaseRepository {
  async create(
    { company_name, contact_person, name, email, phone, address, pan_number, gst_number, website, currency, country, state, city, district, status },
    client = null
  ) {
    const actualContactPerson = contact_person || name || '';
    const sql = `
      INSERT INTO "tblClients" (
        company_name, contact_person, name, email, phone, address, 
        pan_number, gst_number, website, currency, country, state, city, district, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [
        company_name,
        actualContactPerson,
        actualContactPerson,
        email,
        phone,
        address,
        pan_number,
        gst_number,
        website || null,
        currency || 'INR',
        country || null,
        state || null,
        city || null,
        district || null,
        status || 'ACTIVE',
      ],
      client
    );
    return formatClient(result.rows[0]);
  }

  async findAll({ limit = 50, offset = 0 } = {}, client = null) {
    const sql = `
      SELECT * FROM "tblClients"
      ORDER BY id DESC
      LIMIT $1 OFFSET $2;
    `;
    const countSql = `SELECT COUNT(*) FROM "tblClients";`;
    const [dataRes, countRes] = await Promise.all([
      this.query(sql, [limit, offset], client),
      this.query(countSql, [], client),
    ]);
    return {
      clients: dataRes.rows.map(formatClient),
      total: parseInt(countRes.rows[0].count, 10),
    };
  }

  async findById(id, client = null) {
    const sql = `SELECT * FROM "tblClients" WHERE id = $1;`;
    const result = await this.query(sql, [id], client);
    return formatClient(result.rows[0]);
  }

  async findByEmail(email, client = null) {
    const sql = `SELECT * FROM "tblClients" WHERE email = $1;`;
    const result = await this.query(sql, [email], client);
    return formatClient(result.rows[0]);
  }

  async update(
    id,
    { company_name, contact_person, name, email, phone, address, pan_number, gst_number, website, currency, country, state, city, district, status },
    client = null
  ) {
    const actualContactPerson = contact_person || name;
    const sql = `
      UPDATE "tblClients"
      SET company_name = COALESCE($1, company_name),
          contact_person = COALESCE($2, contact_person),
          name = COALESCE($3, name),
          email = COALESCE($4, email),
          phone = COALESCE($5, phone),
          address = COALESCE($6, address),
          pan_number = COALESCE($7, pan_number),
          gst_number = COALESCE($8, gst_number),
          website = COALESCE($9, website),
          currency = COALESCE($10, currency),
          country = COALESCE($11, country),
          state = COALESCE($12, state),
          city = COALESCE($13, city),
          district = COALESCE($14, district),
          status = COALESCE($15, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *;
    `;
    const result = await this.query(
      sql,
      [
        company_name,
        actualContactPerson,
        actualContactPerson,
        email,
        phone,
        address,
        pan_number,
        gst_number,
        website,
        currency,
        country,
        state,
        city,
        district,
        status,
        id,
      ],
      client
    );
    return formatClient(result.rows[0]);
  }

  async delete(id, client = null) {
    const sql = `DELETE FROM "tblClients" WHERE id = $1 RETURNING *;`;
    const result = await this.query(sql, [id], client);
    return formatClient(result.rows[0]);
  }
}

module.exports = new ClientRepository();


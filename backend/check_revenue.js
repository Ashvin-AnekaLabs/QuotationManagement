const { pool } = require('./src/config/database');

async function check() {
  try {
    const res = await pool.query('SELECT quotation_number, grand_total FROM "tblQuotations" WHERE grand_total > 0 ORDER BY grand_total DESC');
    console.table(res.rows);
  } finally {
    pool.end();
  }
}
check();

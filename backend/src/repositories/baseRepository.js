const { pool } = require('../config/database');

/**
 * Reusable Base Repository providing raw SQL execution & transaction management
 */
class BaseRepository {
  /**
   * Execute raw SQL query against pool or client
   * @param {string} text 
   * @param {Array} params 
   * @param {object} [client] 
   */
  async query(text, params = [], client = null) {
    const executor = client || pool;
    return await executor.query(text, params);
  }

  /**
   * Get a client connection from the pool for transactions
   */
  async getTransactionClient() {
    const client = await pool.connect();
    return client;
  }
}

module.exports = BaseRepository;

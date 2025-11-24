const { Pool } = require('pg');
require('dotenv').config();

// Create database connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'eaf_climate_hub',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.on('connect', () => {
  console.log('📦 Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 * @param {string} text - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Database client
 */
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout to release client
  const timeout = setTimeout(() => {
    console.error('Client checkout timeout');
    client.release();
  }, 5000);
  
  client.query = (...args) => {
    return query(...args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.release();
  };
  
  return client;
};

/**
 * Build dynamic WHERE clause for filtering
 * @param {object} filters - Filter conditions
 * @returns {object} { clause, params }
 */
const buildWhereClause = (filters) => {
  const conditions = [];
  const params = [];
  let paramCount = 1;

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        conditions.push(`${key} = ANY($${paramCount})`);
        params.push(value);
      } else if (typeof value === 'string' && value.includes('%')) {
        conditions.push(`${key} ILIKE $${paramCount}`);
        params.push(value);
      } else {
        conditions.push(`${key} = $${paramCount}`);
        params.push(value);
      }
      paramCount++;
    }
  });

  const clause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  return { clause, params };
};

/**
 * Paginate query results
 * @param {string} baseQuery - Base SQL query
 * @param {object} options - { page, limit, orderBy }
 * @returns {object} SQL with pagination
 */
const paginate = (baseQuery, options = {}) => {
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 10;
  const offset = (page - 1) * limit;
  const orderBy = options.orderBy || 'id DESC';

  const paginatedQuery = `
    ${baseQuery}
    ORDER BY ${orderBy}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return { query: paginatedQuery, page, limit };
};

module.exports = {
  pool,
  query,
  getClient,
  buildWhereClause,
  paginate
};

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Create database connection
const dbPath = path.join(__dirname, '../data/eaf_climate_hub.db');
let db;
const dbReady = new Promise((resolve, reject) => {
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Database connection error:', err);
      reject(err);
      return;
    }
    console.log('Database connected.........');
    resolve();
  });
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisify database methods
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const getAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const allAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

/**
 * Execute a query with parameters
 * @param {string} text - SQL query
 * @param {array} params - Query parameters
 * @returns {Promise} Query result
 */
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    // Convert PostgreSQL style parameters ($1, $2) to SQLite style (?)
    const sqliteQuery = text.replace(/\$\d+/g, '?');
    
    // Determine query type
    const queryType = text.trim().toUpperCase().split(' ')[0];
    
    let result;
    if (queryType === 'SELECT') {
      const rows = await allAsync(sqliteQuery, params);
      result = { rows, rowCount: rows.length };
    } else {
      const res = await runAsync(sqliteQuery, params);
      result = { rows: [], rowCount: res.changes, lastID: res.lastID };
    }
    
    const duration = Date.now() - start;
    if (process.env.DB_LOG_QUERIES === 'true') {
      console.log('Executed query', { text: sqliteQuery.substring(0, 100), duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

/**
 * Get a client for transactions (SQLite doesn't use connection pooling)
 * @returns {Promise} Database client
 */
const getClient = async () => {
  return {
    query: async (text, params) => {
      return query(text, params);
    },
    release: () => {
      // No-op for SQLite (no connection pooling)
    }
  };
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
        const placeholders = value.map(() => '?').join(',');
        conditions.push(`${key} IN (${placeholders})`);
        params.push(...value);
      } else if (typeof value === 'string' && value.includes('%')) {
        conditions.push(`${key} LIKE ?`);
        params.push(value);
      } else {
        conditions.push(`${key} = ?`);
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
  db,
  dbReady,
  query,
  getClient,
  buildWhereClause,
  paginate,
  runAsync,
  getAsync,
  allAsync
};

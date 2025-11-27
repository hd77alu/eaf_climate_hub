const { Pool } = require('pg');
require('dotenv').config();

// Connect to the default 'postgres' database to create our database
const setupPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: 'postgres', // Connect to default database first
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function setupDatabase() {
  let client;
  let pool;
  
  try {
    // Step 1: Create the database if it doesn't exist
    console.log('Checking if database exists...');
    client = await setupPool.connect();
    
    const dbCheckResult = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [process.env.DB_NAME || 'eaf_climate_hub']
    );

    if (dbCheckResult.rows.length === 0) {
      console.log('Creating database...');
      await client.query(`CREATE DATABASE ${process.env.DB_NAME || 'eaf_climate_hub'}`);
      console.log('Database created successfully');
    } else {
      console.log('Database already exists');
    }
    
    client.release();
    await setupPool.end();

    // Step 2: Connect to the newly created database and create tables
    console.log('Setting up tables...');
    pool = new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'eaf_climate_hub',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    });

    client = await pool.connect();

    // Drop existing tables if they exist
    await client.query(`
      DROP TABLE IF EXISTS policy_analysis CASCADE;
      DROP TABLE IF EXISTS cached_climate_data CASCADE;
      DROP TABLE IF EXISTS repository_items CASCADE;
    `);

    // Create repository_items table (for policies, reports, research papers)
    await client.query(`
      CREATE TABLE repository_items (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('policy', 'report', 'research')),
        country VARCHAR(100),
        year INTEGER,
        description TEXT,
        source TEXT,
        link VARCHAR(1000),
        file_path VARCHAR(500),
        sector VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for faster searches
    await client.query(`
      CREATE INDEX idx_repository_type ON repository_items(type);
      CREATE INDEX idx_repository_country ON repository_items(country);
      CREATE INDEX idx_repository_year ON repository_items(year);
      CREATE INDEX idx_repository_sector ON repository_items(sector);
    `);

    // Create policy_analysis table (for policy comparison tracking)
    await client.query(`
      CREATE TABLE policy_analysis (
        id SERIAL PRIMARY KEY,
        country VARCHAR(100) NOT NULL,
        governance_score DECIMAL(5,2),
        mitigation_score DECIMAL(5,2),
        adaptation_score DECIMAL(5,2),
        overall_index DECIMAL(5,2),
        source TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(country, source)
      );
    `);

    await client.query(`
      CREATE INDEX idx_policy_analysis_country ON policy_analysis(country);
    `);

    // Create cached_climate_data table (for external API data caching)
    await client.query(`
      CREATE TABLE cached_climate_data (
        id SERIAL PRIMARY KEY,
        country VARCHAR(100) NOT NULL,
        metric VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        month INTEGER,
        value DECIMAL(10,2),
        data_source VARCHAR(100),
        raw_data JSONB,
        cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        UNIQUE(country, metric, year, month)
      );
    `);

    await client.query(`
      CREATE INDEX idx_climate_country_metric ON cached_climate_data(country, metric, year);
    `);

    console.log('Database schema created successfully!');
    console.log('Tables created:');
    console.log('   - repository_items (policies, reports, research)');
    console.log('   - policy_analysis (country comparison scores)');
    console.log('   - cached_climate_data (API cache)');

  } catch (error) {
    console.error('Error setting up database:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
    if (pool) {
      await pool.end();
    }
  }
}

// Run setup
setupDatabase()
  .then(() => {
    console.log('Database setup complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to setup database:', error);
    process.exit(1);
  });

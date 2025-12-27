const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Create database directory if it doesn't exist
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
const dbPath = path.join(dataDir, 'eaf_climate_hub.db');

async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error creating database:', err);
        reject(err);
        return;
      }
      console.log('Database connection established');
    });

    db.serialize(() => {
      console.log('Setting up tables...');

      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');

      // Drop existing tables if they exist
      db.run('DROP TABLE IF EXISTS policy_analysis');
      db.run('DROP TABLE IF EXISTS cached_climate_data');
      db.run('DROP TABLE IF EXISTS repository_items');

      // Create repository_items table (for policies, reports, research papers)
      db.run(`
        CREATE TABLE repository_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title VARCHAR(500) NOT NULL,
          type VARCHAR(50) NOT NULL CHECK (type IN ('policy', 'report', 'research')),
          country VARCHAR(100),
          year INTEGER,
          description TEXT,
          source TEXT,
          link VARCHAR(1000),
          file_path VARCHAR(500),
          sector VARCHAR(100),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating repository_items table:', err);
        } else {
          console.log('Created repository_items table');
        }
      });

      // Create indexes for faster searches
      db.run('CREATE INDEX idx_repository_type ON repository_items(type)');
      db.run('CREATE INDEX idx_repository_country ON repository_items(country)');
      db.run('CREATE INDEX idx_repository_year ON repository_items(year)');
      db.run('CREATE INDEX idx_repository_sector ON repository_items(sector)');

      // Create policy_analysis table (for policy comparison tracking)
      db.run(`
        CREATE TABLE policy_analysis (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          country VARCHAR(100) NOT NULL,
          governance_score DECIMAL(5,2),
          mitigation_score DECIMAL(5,2),
          adaptation_score DECIMAL(5,2),
          overall_index DECIMAL(5,2),
          source TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(country, source)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating policy_analysis table:', err);
        } else {
          console.log('Created policy_analysis table');
        }
      });

      db.run('CREATE INDEX idx_policy_analysis_country ON policy_analysis(country)');

      // Create cached_climate_data table (for external API data caching)
      db.run(`
        CREATE TABLE cached_climate_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          country VARCHAR(100) NOT NULL,
          metric VARCHAR(100) NOT NULL,
          year INTEGER NOT NULL,
          month INTEGER,
          value DECIMAL(10,2),
          data_source VARCHAR(100),
          raw_data TEXT,
          cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          expires_at DATETIME,
          UNIQUE(country, metric, year, month)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating cached_climate_data table:', err);
        } else {
          console.log('Created cached_climate_data table');
        }
      });

      db.run('CREATE INDEX idx_climate_country_metric ON cached_climate_data(country, metric, year)', (err) => {
        if (err) {
          console.error('Error creating index:', err);
          reject(err);
        } else {
          console.log('Database schema created successfully!');
          console.log('Tables created:');
          console.log('   - repository_items (policies, reports, research)');
          console.log('   - policy_analysis (country comparison scores)');
          console.log('   - cached_climate_data (API cache)');
          
          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  });
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

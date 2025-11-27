const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

// Use DATABASE_URL if available (Render), otherwise use individual variables (local)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'eaf_climate_hub',
        password: process.env.DB_PASSWORD || 'postgres',
        port: process.env.DB_PORT || 5432,
      }
);

async function seedData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    console.log('Clearing existing data...');
    await client.query('DELETE FROM policy_analysis');
    await client.query('DELETE FROM cached_climate_data');
    await client.query('DELETE FROM repository_items');
    
    // Reset sequences to start from 1
    await client.query('ALTER SEQUENCE repository_items_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE policy_analysis_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE cached_climate_data_id_seq RESTART WITH 1');
    console.log('Existing data cleared and sequences reset');

    // Load repository data from CSV
    const csvPath = path.join(__dirname, '../data/csv/repository-data.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error('CSV file not found at: ' + csvPath);
    }
    
    console.log('Reading CSV file...');
    await loadFromCSV(client, csvPath);

    // Add policy analysis data
    await addPolicyAnalysisData(client);

    console.log('Data seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function loadFromCSV(client, csvPath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Found ${results.length} items in CSV`);
        
        for (const row of results) {
          try {
            await client.query(`
              INSERT INTO repository_items 
              (title, type, country, year, description, source, link, sector)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              row.title,
              row.type,
              row.country,
              parseInt(row.year) || null,
              row.description,
              row.source,
              row.link,
              row.sector
            ]);
          } catch (err) {
            console.error(`Error inserting row:`, err.message);
          }
        }
        
        console.log(`Inserted ${results.length} repository items`);
        resolve();
      })
      .on('error', reject);
  });
}

async function addPolicyAnalysisData(client) {
  const csvPath = path.join(__dirname, '../data/csv/policy-analysis.csv');
  
  if (!fs.existsSync(csvPath)) {
    throw new Error('Policy analysis CSV file not found at: ' + csvPath);
  }
  
  console.log('Loading policy analysis data from CSV...');
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Found ${results.length} policy analysis records in CSV`);
        
        for (const row of results) {
          try {
            await client.query(`
              INSERT INTO policy_analysis 
              (country, governance_score, mitigation_score, adaptation_score, overall_index, source)
              VALUES ($1, $2, $3, $4, $5, $6)
            `, [
              row.country,
              parseFloat(row.governance_score) || null,
              parseFloat(row.mitigation_score) || null,
              parseFloat(row.adaptation_score) || null,
              parseFloat(row.overall_index) || null,
              row.source
            ]);
          } catch (err) {
            console.error(`Error inserting policy analysis row:`, err.message);
          }
        }
        
        console.log(`Inserted ${results.length} policy analysis records`);
        resolve();
      })
      .on('error', reject);
  });
}

// Run seeding
seedData()
  .then(() => {
    console.log('Data seeding complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to seed data:', error);
    process.exit(1);
  });

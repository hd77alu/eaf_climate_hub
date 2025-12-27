const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

const dbPath = path.join(__dirname, '../data/eaf_climate_hub.db');
const db = new sqlite3.Database(dbPath);

// Promisify db.run
const runAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

async function seedData() {
  try {
    console.log('Starting data seeding...');

    // Clear existing data
    console.log('Clearing existing data...');
    await runAsync('DELETE FROM policy_analysis');
    await runAsync('DELETE FROM cached_climate_data');
    await runAsync('DELETE FROM repository_items');
    
    // Reset sequences (SQLite handles autoincrement automatically)
    console.log('Existing data cleared');

    // Load repository data from CSV
    const csvPath = path.join(__dirname, '../data/csv/repository-data.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error('CSV file not found at: ' + csvPath);
    }
    
    console.log('Reading CSV file...');
    await loadFromCSV(csvPath);

    // Add policy analysis data
    await addPolicyAnalysisData();

    console.log('Data seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding data:', error);
    throw error;
  } finally {
    db.close();
  }
}

async function loadFromCSV(csvPath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log(`Found ${results.length} items in CSV`);
        
        for (const row of results) {
          try {
            await runAsync(`
              INSERT INTO repository_items 
              (title, type, country, year, description, source, link, sector)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
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

async function addPolicyAnalysisData() {
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
            await runAsync(`
              INSERT INTO policy_analysis 
              (country, governance_score, mitigation_score, adaptation_score, overall_index, source)
              VALUES (?, ?, ?, ?, ?, ?)
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

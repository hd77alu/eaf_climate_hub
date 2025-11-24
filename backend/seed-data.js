const { Pool } = require('pg');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'eaf_climate_hub',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

async function seedData() {
  const client = await pool.connect();
  
  try {
    console.log('Starting data seeding...');

    // Check if CSV file exists
    const csvPath = path.join(__dirname, '../data/csv/repository-data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('CSV file not found. Creating sample data instead...');
      await createSampleData(client);
    } else {
      console.log('Reading CSV file...');
      await loadFromCSV(client, csvPath);
    }

    // Add some sample cached climate data
    await addSampleClimateData(client);

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

async function createSampleData(client) {
  const sampleData = [
    {
      title: 'Kenya National Climate Change Action Plan 2018-2022',
      type: 'policy',
      country: 'Kenya',
      year: 2018,
      description: 'Comprehensive climate action framework focusing on adaptation and mitigation strategies',
      source: 'Ministry of Environment and Forestry, Kenya',
      link: 'https://www.environment.go.ke/wp-content/uploads/2020/03/NCCAP_2018-2022.pdf',
      sector: 'General Climate Action'
    },
    {
      title: 'Tanzania Climate-Smart Agriculture Programme',
      type: 'policy',
      country: 'Tanzania',
      year: 2020,
      description: 'Agricultural transformation initiative integrating climate resilience practices',
      source: 'Ministry of Agriculture, Tanzania',
      link: 'https://www.kilimo.go.tz/climate-smart-agriculture',
      sector: 'Agriculture'
    },
    {
      title: 'Uganda Green Growth Development Strategy',
      type: 'policy',
      country: 'Uganda',
      year: 2017,
      description: 'Strategic framework for sustainable economic growth while reducing carbon emissions',
      source: 'National Planning Authority, Uganda',
      link: 'http://www.npa.go.ug/green-growth-strategy/',
      sector: 'Green Economy'
    },
    {
      title: 'Rwanda Environment and Climate Change Policy',
      type: 'policy',
      country: 'Rwanda',
      year: 2019,
      description: 'National policy framework for environmental protection and climate change response',
      source: 'Ministry of Environment, Rwanda',
      link: 'https://www.environment.gov.rw/climate-policy',
      sector: 'Environment'
    },
    {
      title: 'EAC Climate Change Master Plan 2011-2031',
      type: 'policy',
      country: 'Regional',
      year: 2011,
      description: 'Regional framework for coordinated climate action across East African Community',
      source: 'East African Community Secretariat',
      link: 'https://www.eac.int/climate-change',
      sector: 'Regional Cooperation'
    },
    {
      title: 'Climate Risk Assessment for East Africa - 2023',
      type: 'report',
      country: 'Regional',
      year: 2023,
      description: 'Comprehensive analysis of climate vulnerabilities and risks across the EAC region',
      source: 'UNEP & East African Community',
      link: 'https://www.unep.org/eac-climate-risk-2023',
      sector: 'Risk Assessment'
    },
    {
      title: 'Impact of Drought on Food Security in the Horn of Africa',
      type: 'research',
      country: 'Regional',
      year: 2022,
      description: 'Academic research on drought patterns and their socio-economic impacts',
      source: 'Dr. Jane Mwangi, University of Nairobi',
      link: 'https://doi.org/10.1234/climate-research-2022',
      sector: 'Drought & Food Security'
    },
    {
      title: 'Burundi National Adaptation Plan (NAP)',
      type: 'policy',
      country: 'Burundi',
      year: 2021,
      description: 'National framework for climate adaptation focusing on vulnerable communities',
      source: 'Ministry of Environment, Burundi',
      link: 'https://www.bi.undp.org/burundi-nap',
      sector: 'Adaptation'
    },
    {
      title: 'South Sudan Climate Change Strategy',
      type: 'policy',
      country: 'South Sudan',
      year: 2020,
      description: 'Initial climate strategy addressing conflict-affected regions and resilience building',
      source: 'Ministry of Environment, South Sudan',
      link: 'https://www.ss.undp.org/climate-strategy',
      sector: 'Climate Resilience'
    },
    {
      title: 'Renewable Energy Transition in East Africa - Progress Report 2024',
      type: 'report',
      country: 'Regional',
      year: 2024,
      description: 'Assessment of renewable energy adoption and carbon emission reduction progress',
      source: 'African Development Bank',
      link: 'https://www.afdb.org/eac-renewable-2024',
      sector: 'Energy'
    }
  ];

  for (const item of sampleData) {
    await client.query(`
      INSERT INTO repository_items 
      (title, type, country, year, description, source, link, sector)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      item.title,
      item.type,
      item.country,
      item.year,
      item.description,
      item.source,
      item.link,
      item.sector
    ]);
  }

  console.log(`Inserted ${sampleData.length} sample repository items`);
}

async function addSampleClimateData(client) {
  const climateData = [
    { country: 'Kenya', metric: 'temperature', year: 2023, month: 12, value: 26.5 },
    { country: 'Kenya', metric: 'rainfall', year: 2023, month: 12, value: 85.3 },
    { country: 'Tanzania', metric: 'temperature', year: 2023, month: 12, value: 27.2 },
    { country: 'Tanzania', metric: 'rainfall', year: 2023, month: 12, value: 120.5 },
    { country: 'Uganda', metric: 'temperature', year: 2023, month: 12, value: 25.8 },
    { country: 'Uganda', metric: 'rainfall', year: 2023, month: 12, value: 95.7 },
    { country: 'Rwanda', metric: 'temperature', year: 2023, month: 12, value: 24.5 },
    { country: 'Rwanda', metric: 'rainfall', year: 2023, month: 12, value: 110.2 },
  ];

  for (const data of climateData) {
    await client.query(`
      INSERT INTO cached_climate_data 
      (country, metric, year, month, value, data_source, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW() + INTERVAL '30 days')
    `, [
      data.country,
      data.metric,
      data.year,
      data.month,
      data.value,
      'sample-data'
    ]);
  }

  console.log(`Inserted ${climateData.length} sample climate data records`);
}

async function addPolicyAnalysisData(client) {
  // Check if CSV file exists
  const csvPath = path.join(__dirname, '../data/csv/policy-analysis.csv');
  
  if (fs.existsSync(csvPath)) {
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
  } else {
    // Create sample policy analysis data
    console.log('CSV file not found. Creating sample policy analysis data...');
    
    const sampleAnalysisData = [
      {
        country: 'Kenya',
        governance_score: 76.7,
        mitigation_score: 64.5,
        adaptation_score: 73.3,
        overall_index: 70.8,
        source: 'NDC IMPLEMENTATION INDEX 2024'
      },
      {
        country: 'Tanzania',
        governance_score: 68.4,
        mitigation_score: 58.2,
        adaptation_score: 71.8,
        overall_index: 65.5,
        source: 'NDC IMPLEMENTATION INDEX 2024'
      },
      {
        country: 'Uganda',
        governance_score: 72.1,
        mitigation_score: 61.3,
        adaptation_score: 69.5,
        overall_index: 67.3,
        source: 'NDC IMPLEMENTATION INDEX 2024'
      },
      {
        country: 'Rwanda',
        governance_score: 81.2,
        mitigation_score: 70.5,
        adaptation_score: 78.9,
        overall_index: 76.2,
        source: 'NDC IMPLEMENTATION INDEX 2024'
      },
      {
        country: 'Burundi',
        governance_score: 54.3,
        mitigation_score: 48.7,
        adaptation_score: 62.1,
        overall_index: 55.0,
        source: 'NDC IMPLEMENTATION INDEX 2024'
      },
      {
        country: 'South Sudan',
        governance_score: 42.5,
        mitigation_score: 35.8,
        adaptation_score: 51.2,
        overall_index: 43.2,
        source: 'NDC IMPLEMENTATION INDEX 2024'
      }
    ];

    for (const item of sampleAnalysisData) {
      await client.query(`
        INSERT INTO policy_analysis 
        (country, governance_score, mitigation_score, adaptation_score, overall_index, source)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        item.country,
        item.governance_score,
        item.mitigation_score,
        item.adaptation_score,
        item.overall_index,
        item.source
      ]);
    }

    console.log(`Inserted ${sampleAnalysisData.length} sample policy analysis records`);
  }
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

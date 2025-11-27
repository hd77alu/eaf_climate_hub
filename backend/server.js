const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use('/data', express.static('data'));

// Root route - serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// API root endpoint
app.get('/api', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EAF Climate Hub API Documentation</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #fcfbe4;
          min-height: 100vh;
          padding: 40px 20px;
        }
        .container {
          max-width: 1000px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
        }
        .header {
          background: rgb(253, 189, 70);
          color: white;
          padding: 40px;
          text-align: center;
        }
        .header h1 {
          font-size: 2.5em;
          margin-bottom: 10px;
        }
        .header p {
          font-size: 1.1em;
          opacity: 0.9;
        }
        .version {
          display: inline-block;
          background: rgba(255,255,255,0.2);
          padding: 5px 15px;
          border-radius: 20px;
          margin-top: 10px;
          font-size: 0.9em;
        }
        .content {
          padding: 40px;
        }
        .section {
          margin-bottom: 40px;
        }
        .section h2 {
          color: #2c3e50;
          margin-bottom: 20px;
          font-size: 1.8em;
          border-bottom: 3px solid rgb(253, 189, 70);
          padding-bottom: 10px;
        }
        .endpoint {
          background: #f8f9fa;
          border-left: 4px solid rgb(253, 189, 70);
          padding: 20px;
          margin-bottom: 15px;
          border-radius: 8px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .endpoint:hover {
          transform: translateX(5px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
        .method {
          display: inline-block;
          background: #27ae60;
          color: white;
          padding: 5px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 0.85em;
          margin-right: 10px;
        }
        .path {
          font-family: 'Courier New', monospace;
          color: rgb(253, 189, 70);
          font-weight: bold;
          font-size: 1.1em;
        }
        .description {
          color: #666;
          margin-top: 8px;
          line-height: 1.6;
        }
        .status {
          display: inline-block;
          background: #27ae60;
          color: white;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          border-top: 1px solid #eee;
          font-size: 0.9em;
        }
        a {
          color: #667eea;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>East Africa Climate Hub API</h1>
          <p>Comprehensive climate insights across East African Community member states</p>
          <span class="version">v1.0.0</span>
        </div>
        
        <div class="content">
          <div class="section">
            <h2>Repository Endpoints</h2>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/repository/items</span>
              <div class="description">Get all repository items with optional filters: type, country, year, search, sector</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/repository/items/:id</span>
              <div class="description">Get a specific repository item by ID</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/repository/policies</span>
              <div class="description">Get all policies, optionally filtered by country</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/repository/reports</span>
              <div class="description">Get all climate reports</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/repository/research</span>
              <div class="description">Get all research papers</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/repository/countries</span>
              <div class="description">Get list of all available countries</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/repository/sectors</span>
              <div class="description">Get list of all available sectors</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Policy Analysis Endpoints</h2>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/policy-analysis</span>
              <div class="description">Get all policy analysis data with optional filters: country, source</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/policy-analysis/:country</span>
              <div class="description">Get policy analysis for a specific country</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/policy-analysis/ranking/:metric</span>
              <div class="description">Get country rankings by metric (governance_score, mitigation_score, adaptation_score, overall_index)</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/policies/compare</span>
              <div class="description">Compare multiple policies (use ?ids=1,2,3)</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/policies/:country</span>
              <div class="description">Get all policies for a specific country</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Climate Data Endpoints</h2>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/climate/:country/:metric</span>
              <div class="description">Get climate data for a country and metric (with optional year and month filters)</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/climate/metrics</span>
              <div class="description">Get list of all available climate metrics</div>
            </div>
          </div>
          
          <div class="section">
            <h2>Map & Statistics Endpoints</h2>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/map/regions</span>
              <div class="description">Get aggregated data for map visualization by sector</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/map/climate-indicators/:country</span>
              <div class="description">Get latest climate indicators for a specific country</div>
            </div>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/stats/overview</span>
              <div class="description">Get dashboard statistics and overview</div>
            </div>
          </div>
          
          <div class="section">
            <h2>System Endpoints</h2>
            
            <div class="endpoint">
              <span class="method">GET</span>
              <span class="path">/api/health</span>
              <div class="description">Check API and database health status</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Status: <span class="status">ONLINE</span></p>
          <p style="margin-top: 10px;">
            <a href="/api/health">Health Check</a> | 
            <a href="/api/stats/overview">Statistics</a> | 
            <a href="/">Home</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'healthy', 
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy', 
      database: 'disconnected',
      error: error.message 
    });
  }
});

// Get all repository items with filtering
app.get('/api/repository/items', async (req, res) => {
  try {
    const { type, country, year, search, sector } = req.query;
    
    let query = 'SELECT * FROM repository_items WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (country) {
      query += ` AND country = $${paramCount}`;
      params.push(country);
      paramCount++;
    }

    if (year) {
      query += ` AND year = $${paramCount}`;
      params.push(parseInt(year));
      paramCount++;
    }

    if (search) {
      query += ` AND (title ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (sector) {
      query += ` AND sector ILIKE $${paramCount}`;
      params.push(`%${sector}%`);
      paramCount++;
    }

    query += ' ORDER BY year DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching repository items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific repository item by ID
app.get('/api/repository/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM repository_items WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get policies only
app.get('/api/repository/policies', async (req, res) => {
  try {
    const { country } = req.query;
    let query = "SELECT * FROM repository_items WHERE type = 'policy'";
    const params = [];

    if (country) {
      query += ' AND country = $1';
      params.push(country);
    }

    query += ' ORDER BY year DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get reports only
app.get('/api/repository/reports', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM repository_items WHERE type = 'report' ORDER BY year DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get research papers only
app.get('/api/repository/research', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM repository_items WHERE type = 'research' ORDER BY year DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching research:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available sectors
app.get('/api/repository/sectors', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT TRIM(sector) as sector FROM repository_items WHERE sector IS NOT NULL ORDER BY sector'
    );
    res.json(result.rows.map(row => row.sector));
  } catch (error) {
    console.error('Error fetching sectors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available countries
app.get('/api/repository/countries', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT TRIM(country) as country FROM repository_items WHERE country IS NOT NULL ORDER BY country'
    );
    res.json(result.rows.map(row => row.country));
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Compare multiple policies
app.get('/api/policies/compare', async (req, res) => {
  try {
    const { ids } = req.query; // comma-separated policy IDs
    
    if (!ids) {
      return res.status(400).json({ error: 'Policy IDs required' });
    }

    const policyIds = ids.split(',').map(id => parseInt(id));
    const result = await pool.query(
      `SELECT * FROM repository_items 
       WHERE id = ANY($1) AND type = 'policy' 
       ORDER BY year DESC`,
      [policyIds]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error comparing policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get policies by country for comparison
app.get('/api/policies/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const result = await pool.query(
      `SELECT * FROM repository_items 
       WHERE country = $1 AND type = 'policy' 
       ORDER BY year DESC`,
      [country]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching country policies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================
// CLIMATE DATA ENDPOINTS (External API Proxy & Cache)
// =====================================================

// Get climate data (with caching)
app.get('/api/climate/:country/:metric', async (req, res) => {
  try {
    const { country, metric } = req.params;
    const { year, month } = req.query;

    // Check cache first
    let query = `
      SELECT * FROM cached_climate_data 
      WHERE country = $1 AND metric = $2 
      AND expires_at > NOW()
    `;
    const params = [country, metric];
    let paramCount = 3;

    if (year) {
      query += ` AND year = $${paramCount}`;
      params.push(parseInt(year));
      paramCount++;
    }

    if (month) {
      query += ` AND month = $${paramCount}`;
      params.push(parseInt(month));
    }

    query += ' ORDER BY year DESC, month DESC';

    const cached = await pool.query(query, params);

    if (cached.rows.length > 0) {
      return res.json({
        source: 'cache',
        data: cached.rows
      });
    }

    // If not in cache, return message about external API
    // In production, you would call an external API here
    res.json({
      source: 'external-api-placeholder',
      message: 'External API integration pending. Sample data available in cache.',
      data: []
    });

  } catch (error) {
    console.error('Error fetching climate data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all available climate metrics
app.get('/api/climate/metrics', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT metric FROM cached_climate_data ORDER BY metric'
    );
    res.json(result.rows.map(row => row.metric));
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================
// POLICY ANALYSIS ENDPOINTS (Comparison & Tracking)
// =====================================================

// Get all policy analysis data with filtering
app.get('/api/policy-analysis', async (req, res) => {
  try {
    const { country, source } = req.query;
    
    let query = 'SELECT * FROM policy_analysis WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (country) {
      query += ` AND country = $${paramCount}`;
      params.push(country);
      paramCount++;
    }

    if (source) {
      query += ` AND source ILIKE $${paramCount}`;
      params.push(`%${source}%`);
      paramCount++;
    }

    query += ' ORDER BY overall_index DESC, country ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching policy analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get policy analysis for specific country
app.get('/api/policy-analysis/:country', async (req, res) => {
  try {
    const { country } = req.params;
    const result = await pool.query(
      'SELECT * FROM policy_analysis WHERE country = $1 ORDER BY source DESC',
      [country]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No analysis data found for this country' });
    }
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching country analysis:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Compare multiple countries
app.get('/api/policy-analysis/compare', async (req, res) => {
  try {
    const { countries } = req.query; // comma-separated country names
    
    if (!countries) {
      return res.status(400).json({ error: 'Countries parameter required' });
    }

    const countryList = countries.split(',').map(c => c.trim());
    
    const query = `
      SELECT * FROM policy_analysis 
      WHERE country = ANY($1)
      ORDER BY overall_index DESC
    `;

    const result = await pool.query(query, [countryList]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error comparing countries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get ranking by specific metric
app.get('/api/policy-analysis/ranking/:metric', async (req, res) => {
  try {
    const { metric } = req.params;
    
    const validMetrics = ['governance_score', 'mitigation_score', 'adaptation_score', 'overall_index'];
    if (!validMetrics.includes(metric)) {
      return res.status(400).json({ error: 'Invalid metric. Use: governance_score, mitigation_score, adaptation_score, or overall_index' });
    }

    const query = `
      SELECT country, ${metric}, source
      FROM policy_analysis
      WHERE ${metric} IS NOT NULL
      ORDER BY ${metric} DESC
    `;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching ranking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================
// MAP DATA ENDPOINTS
// =====================================================

// Get aggregated data for map visualization
app.get('/api/map/regions', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        sector,
        COUNT(*) as total_items,
        COUNT(*) FILTER (WHERE type = 'policy') as total_policies,
        COUNT(*) FILTER (WHERE type = 'report') as total_reports,
        COUNT(*) FILTER (WHERE type = 'research') as total_research
      FROM repository_items 
      WHERE sector IS NOT NULL
      GROUP BY sector
      ORDER BY sector
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching map data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get climate indicators by country for map
app.get('/api/map/climate-indicators/:country', async (req, res) => {
  try {
    const { country } = req.params;
    
    const result = await pool.query(`
      SELECT metric, year, month, value
      FROM cached_climate_data
      WHERE country = $1
      ORDER BY year DESC, month DESC
      LIMIT 12
    `, [country]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching climate indicators:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================
// STATISTICS & DASHBOARD ENDPOINTS
// =====================================================

// Get dashboard statistics
app.get('/api/stats/overview', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE type = 'policy') as total_policies,
        COUNT(*) FILTER (WHERE type = 'report') as total_reports,
        COUNT(*) FILTER (WHERE type = 'research') as total_research,
        COUNT(DISTINCT country) as total_countries
      FROM repository_items
    `);

    const analysisStats = await pool.query(`
      SELECT 
        COUNT(DISTINCT country) as countries_analyzed,
        AVG(overall_index) as avg_overall_index,
        MAX(overall_index) as highest_index,
        MIN(overall_index) as lowest_index
      FROM policy_analysis
    `);

    res.json({
      ...stats.rows[0],
      ...analysisStats.rows[0]
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
  console.log('EastAfrica Climate Hub Server');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await pool.end();
  process.exit(0);
});

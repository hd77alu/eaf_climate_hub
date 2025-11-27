# Backend Setup Guide

## What's Implemented

### Database Schema
- **repository_items**: Stores policies, reports, and research papers from CSV
- **policy_analysis**: Stores policy comparison scores (governance, mitigation, adaptation)
- **cached_climate_data**: Caches external API data to reduce API calls

### API Endpoints

#### Repository Endpoints (CSV Data)
- `GET /api/repository/items` - Get all items with optional filters (type, country, year, search, sector)
- `GET /api/repository/items/:id` - Get specific item by ID
- `GET /api/repository/policies` - Get policies only
- `GET /api/repository/reports` - Get reports only
- `GET /api/repository/research` - Get research papers only
- `GET /api/repository/countries` - Get list of available countries
- `GET /api/repository/sectors` - Get all available sectors

#### Policy Comparison & Analysis Endpoints
- `GET /api/policies/compare?ids=1,2,3` - Compare multiple policies
- `GET /api/policies/:country` - Get policies by country
- `GET /api/policy-analysis` - Get all policy analysis data
- `GET /api/policy-analysis/:country` - Get policy analysis for specific country
- `GET /api/policy-analysis/ranking/:metric` - Get country rankings by metric (governance_score, mitigation_score, adaptation_score, overall_index)

#### Climate Data Endpoints (API Proxy)
- `GET /api/climate/:country/:metric?year=2023&month=12` - Get climate data (cached)
- `GET /api/climate/metrics` - Get available metrics

#### Map Data Endpoints
- `GET /api/map/regions` - Get aggregated country data for map
- `GET /api/map/climate-indicators/:country` - Get climate indicators for specific country

#### Dashboard Endpoints
- `GET /api/stats/overview` - Get overall statistics
- `GET /api/health` - Health check endpoint

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database

Create a `.env` file in the root directory with the following configuration:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=eaf_climate_hub
DB_PASSWORD=your_password_here
DB_PORT=5432
PORT=3000
```

Replace `your_password_here` with the password you set during PostgreSQL installation.

### 3. Setup Database Schema
```bash
npm run setup-db
```

This will automatically create the database and all required tables.

### 4. Seed Data
```bash
npm run seed
```

This will:
- Load data from `data/csv/repository-data.csv` and `data/csv/policy-analysis.csv` if they exist
- Create sample data for testing
- Add sample climate data to the cache
- Add sample policy analysis data for EAC countries

### 5. Start Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## CSV File Formats

### Repository Data CSV
The `data/csv/repository-data.csv` file should have these columns:

```csv
title,type,country,year,description,source,link,sector
```

- **title**: Full title of the document
- **type**: `policy`, `report`, or `research`
- **country**: Country name (e.g., Kenya, Tanzania, Uganda, Rwanda, Burundi, South Sudan)
- **year**: Publication year (numeric)
- **description**: Brief description
- **source**: Author names or organization
- **link**: URL to the document
- **sector**: Climate focus area (e.g., Agriculture, Water, Energy, Forestry)

### Policy Analysis CSV
The `data/csv/policy-analysis.csv` file should have these columns:

```csv
country,governance_score,mitigation_score,adaptation_score,overall_index,source
```

- **country**: Country name
- **governance_score**: Governance score (0-100)
- **mitigation_score**: Mitigation score (0-100)
- **adaptation_score**: Adaptation score (0-100)
- **overall_index**: Overall index (0-100)
- **source**: Source of the analysis data

## External API Integration

The backend is ready to integrate external climate APIs. To add an API:

1. Install axios: `npm install axios`
2. Add API keys to `.env`
3. Update the `/api/climate/:country/:metric` endpoint in `server.js`
4. Cache results in `cached_climate_data` table

### Recommended APIs:
- **World Bank Climate Data API**: https://datahelpdesk.worldbank.org/knowledgebase/articles/902061
- **OpenWeatherMap**: https://openweathermap.org/api
- **NASA POWER API**: https://power.larc.nasa.gov/docs/
- **NOAA Climate Data**: https://www.ncdc.noaa.gov/cdo-web/webservices/v2

## Map Integration

For the climate map page, use:
- **Leaflet.js**: `<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>`
- Data from `/api/map/regions` endpoint
- GeoJSON for EAC country boundaries

## Testing the API

Test endpoints using curl or browser:

```bash
# Health check
curl http://localhost:3000/api/health

# Get all policies
curl http://localhost:3000/api/repository/policies

# Search repository
curl http://localhost:3000/api/repository/items?search=climate&country=Kenya

# Get map data
curl http://localhost:3000/api/map/regions

# Get statistics
curl http://localhost:3000/api/stats/overview
```

## Next Steps

1. **Add more CSV data** to `data/csv/repository-data.csv`
2. **Integrate external climate API** in server.js
3. **Connect frontend** to these endpoints in `frontend/js/functions.js`
4. **Add map library** to `frontend/js/map.js`
5. **Create charts** using Chart.js in `frontend/js/charts.js`

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check credentials in `.env`
- Verify database exists

### Port Already in Use
- Change PORT in `.env`
- Or kill the process using port 3000

### CSV Import Issues
- Check CSV format matches the template
- Ensure proper encoding (UTF-8)
- Verify semicolon-separated tags

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Express.js Guide: https://expressjs.com/
- Node.js Best Practices: https://github.com/goldbergyoni/nodebestpractices

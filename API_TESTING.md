# API Testing Guide

## Quick Test Commands

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Repository Endpoints

#### Get all repository items
```bash
curl http://localhost:3000/api/repository/items
```

#### Filter by type (policies only)
```bash
curl http://localhost:3000/api/repository/items?type=policy
```

#### Filter by country
```bash
curl http://localhost:3000/api/repository/items?country=Kenya
```

#### Search by keyword
```bash
curl http://localhost:3000/api/repository/items?search=climate
```

#### Combined filters
```bash
curl "http://localhost:3000/api/repository/items?type=policy&country=Tanzania&year=2020"
```

#### Get specific item
```bash
curl http://localhost:3000/api/repository/items/1
```

#### Get all policies
```bash
curl http://localhost:3000/api/repository/policies
```

#### Get policies by country
```bash
curl http://localhost:3000/api/repository/policies?country=Rwanda
```

#### Get all reports
```bash
curl http://localhost:3000/api/repository/reports
```

#### Get all research papers
```bash
curl http://localhost:3000/api/repository/research
```

#### Get available countries
```bash
curl http://localhost:3000/api/repository/countries
```

#### Get available tags
```bash
curl http://localhost:3000/api/repository/tags
```

### Policy Comparison Endpoints

#### Compare multiple policies
```bash
curl "http://localhost:3000/api/policies/compare?ids=1,2,3"
```

#### Get policies for specific country
```bash
curl http://localhost:3000/api/policies/Kenya
```

#### Save a comparison (POST)
```bash
curl -X POST http://localhost:3000/api/policies/comparison \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kenya vs Tanzania Agriculture Policies",
    "countries": ["Kenya", "Tanzania"],
    "policyIds": [1, 2],
    "metrics": {"effectiveness": "high", "scope": "national"}
  }'
```

### Climate Data Endpoints

#### Get climate data for country
```bash
curl http://localhost:3000/api/climate/Kenya/temperature
```

#### Get climate data with filters
```bash
curl "http://localhost:3000/api/climate/Kenya/rainfall?year=2023&month=12"
```

#### Get available metrics
```bash
curl http://localhost:3000/api/climate/metrics
```

### Map Endpoints

#### Get regional data for map
```bash
curl http://localhost:3000/api/map/regions
```

#### Get climate indicators for specific country
```bash
curl http://localhost:3000/api/map/climate-indicators/Uganda
```

### Dashboard Statistics

#### Get overview statistics
```bash
curl http://localhost:3000/api/stats/overview
```

## Using Browser

You can also test GET endpoints directly in your browser:

- http://localhost:3000/api/health
- http://localhost:3000/api/repository/items
- http://localhost:3000/api/repository/policies
- http://localhost:3000/api/map/regions
- http://localhost:3000/api/stats/overview

## Using JavaScript (Frontend)

```javascript
// Get all policies
fetch('http://localhost:3000/api/repository/policies')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Search with filters
fetch('http://localhost:3000/api/repository/items?search=agriculture&country=Kenya')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Compare policies
fetch('http://localhost:3000/api/policies/compare?ids=1,2,3')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Save comparison
fetch('http://localhost:3000/api/policies/comparison', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'My Comparison',
    countries: ['Kenya', 'Tanzania'],
    policyIds: [1, 2],
    metrics: { effectiveness: 'high' }
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

## Expected Response Formats

### Repository Item
```json
{
  "id": 1,
  "title": "Kenya National Climate Change Action Plan 2018-2022",
  "type": "policy",
  "country": "Kenya",
  "year": 2018,
  "description": "Comprehensive climate action framework...",
  "authors": "Ministry of Environment and Forestry, Kenya",
  "source_url": "https://...",
  "tags": ["adaptation", "mitigation", "climate-action"],
  "climate_focus": "general",
  "policy_area": "climate-action",
  "effectiveness_score": 7.5,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### Map Region Data
```json
{
  "country": "Kenya",
  "total_policies": 5,
  "avg_effectiveness": 7.2,
  "climate_focuses": ["general", "agriculture", "water"]
}
```

### Statistics Overview
```json
{
  "total_policies": 15,
  "total_reports": 8,
  "total_research": 6,
  "total_countries": 7
}
```

### Health Check
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

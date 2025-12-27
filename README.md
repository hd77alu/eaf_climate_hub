# EastAfrica Climate Hub

A comprehensive web platform providing reliable climate insights across East African Community member states for researchers, policy makers, and environmental leaders.

- **[Live Website](https://eaf-climate-hub.onrender.com/)**

## Features

- **Regional Analysis**: Climate trends and patterns across the EAC region
- **Data Visualization**: Interactive charts and graphs displaying temperature, rainfall, and drought data
- **Policy Effectiveness Tracking**: Monitor policy performance against climate outcomes
- **Regional Comparison Tools**: Analyze policy approaches between member states
- **Interactive Regional Map**: Visual indicators of Regional climate response and climate policy performance
- **Climate Data Repository**: Comprehensive database of policies, reports, and research papers

## Technology Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Visualization**: Chart.js, Leaflet.js

## Project Structure

```
eaf_climate_hub/
├── frontend/
│   ├── pages/
│   │   ├── index.html
│   │   ├── climate-data-repository.html
│   │   ├── policy-analysis.html
│   │   └── climate-map.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── functions.js
│       └── map.js
├── backend/
│   ├── server.js
│   ├── db.js
│   ├── database-setup.js
│   └── seed-data.js
├── data/
│   ├── csv/
│   │   ├── repository-data.csv
│   │   └── policy-analysis.csv
│   └── geojason/
│       ├── Burundi_ADM0_simplified.simplified.geojson
│       ├── DR_Congo_ADM0_simplified.simplified.geojson
│       ├── Kenya_ADM0_simplified.simplified.geojson
│       ├── Rwanda_ADM0_simplified.simplified.geojson
│       ├── Somalia_ADM0_simplified.simplified.geojson
│       ├── South_Sudan_ADM0_simplified.simplified.geojson
│       ├── Tanzania_ADM0_simplified.simplified.geojson
│       └── Uganda_ADM0_simplified.simplified.geojson
├── .gitignore
├── package.json
├── package-lock.json
├── API_TESTING.md
├── BACKEND_SETUP.md
└── README.md
```

## Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database Schema**
   ```bash
   npm run setup-db
   ```
   This will automatically create the SQLite database file (`data/eaf_climate_hub.db`) and all required tables.

3. **Seed Data**
   ```bash
   npm run seed
   ```

4. **Start Server**
   ```bash
   npm start
   ```

5. **Access Application**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/api`

For detailed backend setup and API documentation, see [BACKEND_SETUP.md](BACKEND_SETUP.md)


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
- **Database**: PostgreSQL
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
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)

> **Note:** Make sure PostgreSQL is installed and running on your machine before proceeding.

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   
   Create a `.env` file in the root directory:
   
   ```bash
   touch .env
   ```
   
   Then add the following configuration to the `.env` file:
   
   ```env
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=eaf_climate_hub
   DB_PASSWORD=your_password_here
   DB_PORT=5432
   PORT=3000
   ```
   
   Replace `your_password_here` with your PostgreSQL password.

3. **Setup Database Schema**
   ```bash
   npm run setup-db
   ```
   This will automatically create the database and all required tables.

4. **Seed Data**
   ```bash
   npm run seed
   ```

5. **Start Server**
   ```bash
   npm start
   ```
   

6. **Access Application**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:3000/api`

For detailed backend setup and API documentation, see [BACKEND_SETUP.md](BACKEND_SETUP.md)


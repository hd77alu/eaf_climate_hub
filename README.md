# EastAfrica Climate Hub

A comprehensive web platform providing reliable climate insights across East African Community member states for researchers, policy makers, and environmental leaders.

## Features

- **Data Visualization**: Interactive charts and graphs displaying temperature, rainfall, and drought data
- **Regional Analysis**: Climate trends and patterns across the EAC region
- **Policy-Climate Correlation**: Link climate data with relevant policy responses
- **Policy Effectiveness Tracking**: Monitor policy performance against climate outcomes
- **Regional Comparison Tools**: Analyze policy approaches between member states
- **Interactive Regional Map**: Visual indicators of climate impacts and policy responses
- **Climate Data Repository**: Comprehensive database of policies, reports, and research papers
- **Policy Search & Comparison**: Find and compare policies across EAC countries

## Technology Stack

- **Frontend**: HTML, CSS, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **Visualization**: Chart.js

## Project Structure

```
eastafrica-climate-hub/
├── frontend/
│   ├── pages/
│   │   ├── index.html
│   │   ├── dashboard.html
│   │   ├── climate-data-repository.html
│   │   ├── policy-comparison-tracking.html
│   │   └── climate-map.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── functions.js
│       ├── charts.js
│       └── map.js
├── backend/
│   ├── server.js
│   ├── database-setup.js
│   └── seed-data.js
├── data/
│   └── csv/
│       ├── climate-data.csv
│       ├── policy-analysis.csv
│       
├── package.json
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
   - Health Check: `http://localhost:3000/api/health`

For detailed backend setup and API documentation, see [BACKEND_SETUP.md](BACKEND_SETUP.md)


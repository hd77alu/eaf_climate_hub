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
│       ├── policies.csv
│       ├── reports.csv
│       └── research-papers.csv
├── package.json
└── README.md
```

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   ```bash
   npm run setup-db
   ```

3. **Seed Data**
   ```bash
   npm run seed
   ```

4. **Start Server**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```


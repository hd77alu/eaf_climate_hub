// Tab Navigation Logic with Dynamic Content Loading
document.addEventListener('DOMContentLoaded', () => {
  const tabTriggers = document.querySelectorAll('.tab-trigger');
  const tabContents = document.querySelectorAll('.tab-content');

  // Map tab IDs to HTML files
  const contentFiles = {
    'dashboard': '/pages/index.html',
    'climate': '/pages/climate-data-repository.html',
    'map': '/pages/climate-map.html',
    'policy-analysis': '/pages/policy-analysis.html'
  };

  // Scroll to Top Button
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  
  // Show/hide scroll to top button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add('show');
    } else {
      scrollToTopBtn.classList.remove('show');
    }
  });
  
  // Scroll to top when button is clicked
  scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Load content for a specific tab
  async function loadTabContent(tabId) {
    const contentDiv = document.getElementById(tabId);
    
    // Check if content already loaded
    if (contentDiv.getAttribute('data-loaded') === 'true') {
      return;
    }

    // Skip loading for dashboard (already in index.html)
    if (tabId === 'dashboard') {
      contentDiv.setAttribute('data-loaded', 'true');
      return;
    }

    try {
      const response = await fetch(contentFiles[tabId]);
      const html = await response.text();
      
      // Extract content from body tag (avoid loading full HTML structure)
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const bodyContent = doc.body.innerHTML;
      
      contentDiv.innerHTML = bodyContent;
      contentDiv.setAttribute('data-loaded', 'true');
      
      // Initialize any JS specific to this tab
      initializeTabScripts(tabId);
    } catch (error) {
      console.error(`Error loading ${tabId} content:`, error);
      contentDiv.innerHTML = '<div class="content-section"><p>Error loading content. Please try again.</p></div>';
    }
  }

  // Initialize scripts for specific tabs
  function initializeTabScripts(tabId) {
    if (tabId === 'map' && typeof initializeMap === 'function') {
      initializeMap();
    } else if (tabId === 'dashboard' && typeof initializeCharts === 'function') {
      initializeCharts();
    } else if (tabId === 'climate') {
      initializeRepository();
    } else if (tabId === 'policy-analysis') {
      loadPolicyAnalysis();
    }
  }

  tabTriggers.forEach(trigger => {
    trigger.addEventListener('click', async () => {
      const targetTab = trigger.getAttribute('data-tab');
      
      // Remove active class from all triggers and contents
      tabTriggers.forEach(t => t.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Add active class to clicked trigger
      trigger.classList.add('active');
      
      // Load content if not already loaded
      await loadTabContent(targetTab);
      
      // Show the tab
      document.getElementById(targetTab).classList.add('active');
      
      // Fix Leaflet map rendering issue when tab becomes visible
      if (targetTab === 'map' && typeof map !== 'undefined' && map) {
        setTimeout(() => {
          map.invalidateSize();
        }, 100);
      }
    });
  });

  // Mark dashboard as loaded on initial page load
  const dashboardDiv = document.getElementById('dashboard');
  if (dashboardDiv) {
    dashboardDiv.setAttribute('data-loaded', 'true');
    // Load all climate data on page load
    loadNASAClimateData();
    loadClimateData();
  }
});

// NASA POWER API Integration
async function loadNASAClimateData() {
  // EAC countries with coordinates (capital cities)
  const countries = [
    { code: 'BDI', name: 'Burundi', lat: -3.361378, lon: 29.918886 },
    { code: 'TZA', name: 'Tanzania', lat: -6.792354, lon: 39.208328 },
    { code: 'KEN', name: 'Kenya', lat: -1.286389, lon: 36.817223 },
    { code: 'RWA', name: 'Rwanda', lat: -1.940278, lon: 29.873888 },
    { code: 'UGA', name: 'Uganda', lat: 0.347596, lon: 32.582520 },
    { code: 'SSD', name: 'South Sudan', lat: 4.859363, lon: 31.571251 },
    { code: 'SOM', name: 'Somalia', lat: 2.046934, lon: 45.318162 },
    { code: 'COD', name: 'Democratic Republic of Congo', lat: -4.322447, lon: 15.307045 }
  ];

  try {
    // Load all climate data sections
    await Promise.all([
      loadRegionalSummary(countries),
      loadTemperatureData(countries),
      loadTemperatureTrends(countries),
      loadRainfallData(countries),
      loadDroughtRisk(countries)
    ]);
  } catch (error) {
    console.error('Error loading NASA climate data:', error);
  }
}

// Load regional summary statistics
async function loadRegionalSummary(countries) {
  const loading = document.getElementById('regional-loading');
  const container = document.getElementById('regional-stats');

  try {
    loading.style.display = 'block';
    
    // Fetch recent data for regional average
    const currentYear = new Date().getFullYear() - 1;
    const promises = countries.map(country =>
      fetch(`https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M,PRECTOTCORR&community=AG&longitude=${country.lon}&latitude=${country.lat}&start=${currentYear}&end=${currentYear}&format=JSON`)
        .then(res => res.json())
    );

    const results = await Promise.all(promises);
    
    let totalTemp = 0;
    let totalRainfall = 0;
    let count = 0;

    results.forEach(data => {
      if (data.properties?.parameter?.T2M && data.properties?.parameter?.PRECTOTCORR) {
        // Annual value is stored with key like "202313" (year + 13 for annual)
        const annualKey = `${currentYear}13`;
        const tempData = data.properties.parameter.T2M[annualKey];
        const rainfallData = data.properties.parameter.PRECTOTCORR[annualKey];
        
        if (tempData && rainfallData) {
          totalTemp += tempData;
          totalRainfall += rainfallData * 365; // Convert mm/day to mm/year
          count++;
        }
      }
    });

    const avgTemp = count > 0 ? (totalTemp / count).toFixed(1) : 'N/A';
    const avgRainfall = count > 0 ? (totalRainfall / count).toFixed(0) : 'N/A';

    loading.style.display = 'none';
    
    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Regional Avg Temperature</div>
        <div class="stat-value">${avgTemp}</div>
        <div class="stat-unit">°C</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Regional Avg Rainfall</div>
        <div class="stat-value">${avgRainfall}</div>
        <div class="stat-unit">mm/year</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Countries Monitored</div>
        <div class="stat-value">${countries.length}</div>
        <div class="stat-unit">EAC Member States</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Data Year</div>
        <div class="stat-value">${currentYear}</div>
        <div class="stat-unit">Latest Available</div>
      </div>
    `;
  } catch (error) {
    loading.style.display = 'none';
    container.innerHTML = '<p style="color: white;">Error loading regional summary</p>';
    console.error('Regional summary error:', error);
  }
}

// Load average annual temperature by country
async function loadTemperatureData(countries) {
  const loading = document.getElementById('temp-loading');
  const container = document.getElementById('temperature-grid');

  try {
    loading.style.display = 'block';
    
    const currentYear = new Date().getFullYear() - 1;
    const promises = countries.map(country =>
      fetch(`https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M&community=AG&longitude=${country.lon}&latitude=${country.lat}&start=${currentYear}&end=${currentYear}&format=JSON`)
        .then(res => res.json())
        .then(data => ({ ...country, data }))
    );

    const results = await Promise.all(promises);
    
    loading.style.display = 'none';
    container.innerHTML = '';

    results.forEach(result => {
      const annualKey = `${currentYear}13`; // Annual average key
      const temp = result.data.properties?.parameter?.T2M?.[annualKey];
      
      if (temp) {
        const card = document.createElement('div');
        card.className = 'climate-card temp';
        
        // Country-specific background images
        const countryBackgrounds = {
          'Burundi': 'url(https://www.pixelstalk.net/wp-content/uploads/2025/08/Dramatic-Clouds-and-Sky-Over-Burundi-Landscape-Wallpaper.jpeg)',
          'Tanzania': 'url(https://i.vimeocdn.com/video/490581814-1d5468df179373445ecff7ef906379ba44ba0aae90c36b037adc2e039e67ecb2-d?f=webp)',
          'Kenya': 'url(https://wallpapercave.com/wp/wp1918982.jpg)',
          'Rwanda': 'url(https://www.ugandarwanda-safaris.com/wp-content/uploads/2025/11/Best-Things-to-Do-in-Rwanda-Safari.gif)',
          'Uganda': 'url(https://images7.alphacoders.com/360/360379.jpeg)',
          'South Sudan': 'url(https://www.wildimages-phototours.com/wp-content/uploads/2021/03/Toposa-dancers-7-South-Sudan-Inger-Vandyke.jpg)',
          'Democratic Republic of Congo': 'url(https://s27142.pcdn.co/wp-content/uploads/2018/04/Okapi-Epulu-230-e1524266061252.jpg)',
          'Somalia': 'url(https://th.bing.com/th/id/R.b6a3fe47b12fd61a714219be5f2e3902?rik=UFA9a4oqYeKpCw&pid=ImgRaw&r=0)'
        };
        
        // Apply background image
        if (countryBackgrounds[result.name]) {
          card.style.backgroundImage = countryBackgrounds[result.name];
          card.style.backgroundSize = 'cover';
          card.style.backgroundPosition = 'center';
        }

        card.innerHTML = `
          <h3>${result.name}</h3>
          <div class="value">${temp.toFixed(1)}°C</div>
          <div class="label">Average Annual Temperature</div>
          <div class="year">Year: ${currentYear}</div>
        `;
        container.appendChild(card);
      }
    });
  } catch (error) {
    loading.style.display = 'none';
    console.error('Temperature data error:', error);
  }
}

// Load temperature trends for chart
async function loadTemperatureTrends(countries) {
  const loading = document.getElementById('trends-loading');
  const canvas = document.getElementById('temperature-chart');

  try {
    loading.style.display = 'block';
    
    const endYear = new Date().getFullYear() - 1;
    const startYear = endYear - 4;
    
    // Fetch data for all countries
    const promises = countries.map(country =>
      fetch(`https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=T2M&community=AG&longitude=${country.lon}&latitude=${country.lat}&start=${startYear}&end=${endYear}&format=JSON`)
        .then(res => res.json())
        .then(data => ({ ...country, data }))
    );

    const results = await Promise.all(promises);
    
    // Define colors for each country
    const countryColors = [
      { border: 'rgb(245, 87, 108)', background: 'rgba(245, 87, 108, 0.1)' },
      { border: 'rgba(8, 15, 222, 1)', background: 'rgba(79, 172, 254, 0.1)' },
      { border: 'rgb(34, 197, 94)', background: 'rgba(34, 197, 94, 0.1)' },
      { border: 'rgb(168, 85, 247)', background: 'rgba(168, 85, 247, 0.1)' },
      { border: 'rgb(251, 146, 60)', background: 'rgba(251, 146, 60, 0.1)' },
      { border: 'rgb(236, 72, 153)', background: 'rgba(236, 72, 153, 0.1)' },
      { border: 'rgb(14, 165, 233)', background: 'rgba(14, 165, 233, 0.1)' },
      { border: 'rgb(234, 179, 8)', background: 'rgba(234, 179, 8, 0.1)' }
    ];
    
    const datasets = [];
    const years = [];
    
    // Generate year labels
    for (let year = startYear; year <= endYear; year++) {
      years.push(year.toString());
    }
    
    // Create dataset for each country
    results.forEach((result, index) => {
      const temps = result.data.properties?.parameter?.T2M;
      
      if (temps) {
        const values = [];
        
        for (let year = startYear; year <= endYear; year++) {
          const annualKey = `${year}13`;
          if (temps[annualKey]) {
            values.push(temps[annualKey]);
          } else {
            values.push(null);
          }
        }
        
        datasets.push({
          label: result.name,
          data: values,
          borderColor: countryColors[index].border,
          backgroundColor: countryColors[index].background,
          tension: 0.4,
          fill: false,
          borderWidth: 2
        });
      }
    });
    
    loading.style.display = 'none';
    
    // Create chart
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              padding: 10,
              font: {
                size: 11
              }
            }
          },
          title: {
            display: true,
            text: 'Temperature Trends Over Time - All EAC Countries',
            font: {
              size: 14,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            title: {
              display: true,
              text: 'Temperature (°C)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Year'
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        }
      }
    });
  } catch (error) {
    loading.style.display = 'none';
    console.error('Temperature trends error:', error);
  }
}

// Load rainfall patterns with historical comparison
async function loadRainfallData(countries) {
  const loading = document.getElementById('rainfall-loading');
  const container = document.getElementById('rainfall-grid');

  try {
    loading.style.display = 'block';
    
    // Add rainfall-grid class for 2-column layout
    container.classList.add('rainfall-grid');
    
    const currentYear = new Date().getFullYear() - 1;
    const historicalStart = currentYear - 10;
    
    const promises = countries.map(async country => {
      const response = await fetch(`https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR&community=AG&longitude=${country.lon}&latitude=${country.lat}&start=${historicalStart}&end=${currentYear}&format=JSON`);
      const data = await response.json();
      return { ...country, data };
    });

    const results = await Promise.all(promises);
    
    loading.style.display = 'none';
    container.innerHTML = '';

    results.forEach(result => {
      const rainfall = result.data.properties?.parameter?.PRECTOTCORR;
      
      if (rainfall) {
        // Get annual values (keys ending in 13)
        const annualValues = [];
        for (let year = historicalStart; year <= currentYear; year++) {
          const annualKey = `${year}13`;
          if (rainfall[annualKey]) {
            annualValues.push(rainfall[annualKey] * 365); // Convert mm/day to mm/year
          }
        }
        
        if (annualValues.length > 0) {
          const current = annualValues[annualValues.length - 1];
          const historicalAvg = annualValues.slice(0, -1).reduce((a, b) => a + b, 0) / (annualValues.length - 1);
          
          const deficit = ((current - historicalAvg) / historicalAvg * 100).toFixed(1);
          const deficitText = deficit > 0 
            ? `+${deficit}% vs historical avg` 
            : `${deficit}% vs historical avg`;
          
          const card = document.createElement('div');
          card.className = 'climate-card rainfall';
          card.innerHTML = `
            <h3>${result.name}</h3>
            <div class="value">${current.toFixed(0)} mm</div>
            <div class="label">Current Annual Rainfall (${currentYear})</div>
            <div class="deficit">${deficitText}</div>
            <div class="year">Historical avg: ${historicalAvg.toFixed(0)} mm</div>
          `;
          container.appendChild(card);
        }
      }
    });
  } catch (error) {
    loading.style.display = 'none';
    console.error('Rainfall data error:', error);
  }
}

// Load drought risk assessment
async function loadDroughtRisk(countries) {
  const loading = document.getElementById('drought-loading');
  const container = document.getElementById('drought-risk');

  try {
    loading.style.display = 'block';
    
    const currentYear = new Date().getFullYear() - 1;
    const historicalStart = currentYear - 10;
    
    const promises = countries.map(async country => {
      const response = await fetch(`https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=PRECTOTCORR&community=AG&longitude=${country.lon}&latitude=${country.lat}&start=${historicalStart}&end=${currentYear}&format=JSON`);
      const data = await response.json();
      return { ...country, data };
    });

    const results = await Promise.all(promises);
    
    loading.style.display = 'none';
    container.innerHTML = '';

    results.forEach(result => {
      const rainfall = result.data.properties?.parameter?.PRECTOTCORR;
      
      if (rainfall) {
        // Get annual values (keys ending in 13)
        const annualValues = [];
        for (let year = historicalStart; year <= currentYear; year++) {
          const annualKey = `${year}13`;
          if (rainfall[annualKey]) {
            annualValues.push(rainfall[annualKey] * 365); // Convert mm/day to mm/year
          }
        }
        
        if (annualValues.length > 0) {
          const current = annualValues[annualValues.length - 1];
          const historicalAvg = annualValues.slice(0, -1).reduce((a, b) => a + b, 0) / (annualValues.length - 1);
          
          const deficitPercent = ((historicalAvg - current) / historicalAvg * 100);
          
          // Determine risk level
          let riskLevel, riskClass, details;
          if (deficitPercent < 10) {
            riskLevel = 'Low Risk';
            riskClass = 'low';
            details = 'Adequate rainfall levels. Normal agricultural conditions expected.';
          } else if (deficitPercent < 25) {
            riskLevel = 'Moderate Risk';
            riskClass = 'moderate';
            details = 'Below average rainfall. Monitor crop conditions and water resources.';
          } else {
            riskLevel = 'High Risk';
            riskClass = 'high';
            details = 'Significant rainfall deficit. Measures recommended.';
          }
          
          const card = document.createElement('div');
          card.className = `risk-card ${riskClass}`;
          card.innerHTML = `
            <h4>${result.name.toUpperCase()}</h4>
            <div class="risk-level">${riskLevel}</div>
            <div class="percentage">Deficit: ${deficitPercent > 0 ? deficitPercent.toFixed(1) : 0}%</div>
            <div class="risk-details">${details}</div>
          `;
          container.appendChild(card);
        }
      }
    });
  } catch (error) {
    loading.style.display = 'none';
    console.error('Drought risk error:', error);
  }
}

// World Bank API Integration
async function loadClimateData() {
  const loading = document.getElementById('loading');
  const gridContainer = document.getElementById('climate-data-grid');
  const errorMessage = document.getElementById('error-message');

  // EAC country codes
  const countries = [
    { code: 'BDI', name: 'Burundi' },
    { code: 'TZA', name: 'Tanzania' },
    { code: 'KEN', name: 'Kenya' },
    { code: 'RWA', name: 'Rwanda' },
    { code: 'UGA', name: 'Uganda' },
    { code: 'SSD', name: 'South Sudan' },
    { code: 'SOM', name: 'Somalia' },
    { code: 'COD', name: 'Democratic Republic of Congo' }
    
  ];

  // Climate indicators to fetch
  const indicators = [
    { code: 'EN.ATM.CO2E.PC', label: 'CO2 Emissions', unit: 'metric tons per capita' },
    { code: 'AG.LND.FRST.ZS', label: 'Forest Area', unit: '% of land area' },
    { code: 'EG.USE.ELEC.KH.PC', label: 'Electric Power Consumption', unit: 'kWh per capita' },
    { code: 'EN.ATM.GHGT.KT.CE', label: 'Total GHG Emissions', unit: 'kt of CO2 equivalent' }
  ];

  try {
    loading.style.display = 'block';
    gridContainer.innerHTML = '';
    errorMessage.classList.remove('show');

    const climateData = [];

    // Fetch data for each country and indicator
    for (const country of countries) {
      for (const indicator of indicators) {
        const url = `https://api.worldbank.org/v2/country/${country.code}/indicator/${indicator.code}?format=json&per_page=1&date=2020:2023`;
        
        try {
          const response = await fetch(url);
          const data = await response.json();
          
          if (data && data[1] && data[1].length > 0) {
            const latestData = data[1][0];
            if (latestData.value !== null) {
              climateData.push({
                country: country.name,
                indicator: indicator.label,
                value: latestData.value,
                unit: indicator.unit,
                year: latestData.date
              });
            }
          }
        } catch (err) {
          console.error(`Error fetching ${indicator.label} for ${country.name}:`, err);
        }
      }
    }

    // Display the data
    if (climateData.length === 0) {
      throw new Error('No climate data available');
    }

    loading.style.display = 'none';
    
    // Country-specific background images for Environmental Indicators
    const countryBackgrounds = {
      'Burundi': 'https://coffeepursuing.com/wp-content/uploads/2023/03/when-to-drink-espresso-in-italy-1679891712.0806174.jpg',
      'Tanzania': 'https://img.freepik.com/free-photo/ferocious-lion-studio_23-2151003433.jpg?size=626&ext=jpg',
      'Kenya': 'https://img.freepik.com/premium-psd/3d-cup-tea_805221-34.jpg',
      'Rwanda': 'https://img.freepik.com/premium-photo/angry-gorilla-head-with-gray-background_1221750-98.jpg',
      'Uganda': 'https://img.freepik.com/premium-photo/3d-fish-icon-marine-life-food-logo-illustration_762678-33591.jpg',
      'South Sudan': 'https://tse3.mm.bing.net/th/id/OIP.Ei22qmXkkHHKw2JxdmTlJAHaHa?rs=1&pid=ImgDetMain&o=7&rm=3',
      'Democratic Republic of Congo': 'https://img.freepik.com/premium-photo/okapi-animal-design-illustration_1085248-260.jpg',
      'Somalia': 'https://img.freepik.com/premium-photo/view-graphic-3d-sheep_978521-32405.jpg'
    };
    
    climateData.forEach(item => {
      // Skip Kenya Electric Power Consumption card
      if (item.country === 'Kenya' && item.indicator === 'Electric Power Consumption') {
        return;
      }
      
      const card = document.createElement('div');
      card.className = 'climate-card';
      
      // Apply country-specific background image
      if (countryBackgrounds[item.country]) {
        card.style.backgroundImage = `url(${countryBackgrounds[item.country]})`;
        card.style.backgroundSize = '30%';
        card.style.backgroundPosition = 'center';
      }
      
      const formattedValue = typeof item.value === 'number' 
        ? item.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : item.value;
      
      card.innerHTML = `
        <h3>${item.country}</h3>
        <div class="value">${formattedValue}</div>
        <div class="label">${item.indicator}</div>
        <div class="year">${item.unit} (${item.year})</div>
      `;
      
      gridContainer.appendChild(card);
    });

  } catch (error) {
    loading.style.display = 'none';
    errorMessage.textContent = `Failed to load climate data: ${error.message}`;
    errorMessage.classList.add('show');
    console.error('Climate data error:', error);
  }
}

// Climate Data Repository Functionality
let allDocuments = [];
let filteredDocuments = [];
let displayedCount = 0;
const DOCS_PER_PAGE = 15;

async function initializeRepository() {
  try {
    // Load filter options
    await loadFilterOptions();
    
    // Load all documents
    await loadRepositoryDocuments();
    
    // Set up event listeners
    setupRepositoryListeners();
  } catch (error) {
    console.error('Error initializing repository:', error);
  }
}

async function loadFilterOptions() {
  try {
    // Load countries
    const countriesRes = await fetch('http://localhost:3000/api/repository/countries');
    const countries = await countriesRes.json();
    const countrySelect = document.getElementById('filter-country');
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
    
    // Load sectors
    const sectorsRes = await fetch('http://localhost:3000/api/repository/sectors');
    const sectors = await sectorsRes.json();
    const sectorSelect = document.getElementById('filter-sector');
    sectors.forEach(sector => {
      const option = document.createElement('option');
      option.value = sector;
      option.textContent = sector;
      sectorSelect.appendChild(option);
    });
  } catch (error) {
    console.error('Error loading filter options:', error);
  }
}

async function loadRepositoryDocuments() {
  const loading = document.getElementById('repo-loading');
  const errorDiv = document.getElementById('repo-error');
  
  try {
    loading.style.display = 'block';
    errorDiv.textContent = '';
    
    const response = await fetch('http://localhost:3000/api/repository/items');
    
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }
    
    allDocuments = await response.json();
    filteredDocuments = [...allDocuments];
    
    loading.style.display = 'none';
    
    displayedCount = 0;
    displayDocuments();
    
  } catch (error) {
    loading.style.display = 'none';
    errorDiv.textContent = `Error loading documents: ${error.message}`;
    console.error('Repository error:', error);
  }
}

function setupRepositoryListeners() {
  const searchInput = document.getElementById('repo-search');
  const typeFilter = document.getElementById('filter-type');
  const countryFilter = document.getElementById('filter-country');
  const sectorFilter = document.getElementById('filter-sector');
  const clearBtn = document.getElementById('clear-filters');
  const showMoreBtn = document.getElementById('show-more-btn');
  
  // Search with debounce
  let searchTimeout;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      applyFilters();
    }, 300);
  });
  
  // Filter changes
  typeFilter.addEventListener('change', applyFilters);
  countryFilter.addEventListener('change', applyFilters);
  sectorFilter.addEventListener('change', applyFilters);
  
  // Clear filters
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    typeFilter.value = '';
    countryFilter.value = '';
    sectorFilter.value = '';
    applyFilters();
  });
  
  // Show more
  showMoreBtn.addEventListener('click', () => {
    displayDocuments(true);
  });
}

function applyFilters() {
  const searchTerm = document.getElementById('repo-search').value.toLowerCase();
  const typeFilter = document.getElementById('filter-type').value;
  const countryFilter = document.getElementById('filter-country').value;
  const sectorFilter = document.getElementById('filter-sector').value;
  
  filteredDocuments = allDocuments.filter(doc => {
    // Search filter
    const matchesSearch = !searchTerm || 
      doc.title.toLowerCase().includes(searchTerm) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm)) ||
      (doc.source && doc.source.toLowerCase().includes(searchTerm));
    
    // Type filter
    const matchesType = !typeFilter || doc.type === typeFilter;
    
    // Country filter
    const matchesCountry = !countryFilter || doc.country === countryFilter;
    
    // Sector filter
    const matchesSector = !sectorFilter || doc.sector === sectorFilter;
    
    return matchesSearch && matchesType && matchesCountry && matchesSector;
  });
  
  displayedCount = 0;
  displayDocuments();
}

function displayDocuments(append = false) {
  const grid = document.getElementById('documents-grid');
  const resultsCount = document.getElementById('results-count');
  const showMoreBtn = document.getElementById('show-more-btn');
  
  if (!append) {
    grid.innerHTML = '';
    displayedCount = 0;
  }
  
  const docsToShow = filteredDocuments.slice(displayedCount, displayedCount + DOCS_PER_PAGE);
  displayedCount += docsToShow.length;
  
  // Update results count
  resultsCount.textContent = `Showing ${displayedCount} of ${filteredDocuments.length} documents`;
  
  // Show/hide "Show More" button
  if (displayedCount < filteredDocuments.length) {
    showMoreBtn.style.display = 'block';
  } else {
    showMoreBtn.style.display = 'none';
  }
  
  if (filteredDocuments.length === 0) {
    grid.innerHTML = '<div class="no-results">No documents found matching your criteria.</div>';
    resultsCount.textContent = '';
    return;
  }
  
  docsToShow.forEach(doc => {
    const card = createDocumentCard(doc);
    grid.appendChild(card);
  });
}

function createDocumentCard(doc) {
  const card = document.createElement('div');
  card.className = 'document-card';
  
  const typeClass = doc.type || 'document';
  const typeBadge = `<span class="type-badge ${typeClass}">${doc.type || 'Document'}</span>`;
  
  card.innerHTML = `
    <div class="document-header">
      ${typeBadge}
      <span class="document-year">${doc.year || 'N/A'}</span>
    </div>
    <h3 class="document-title">${doc.title}</h3>
    <div class="document-meta">
      <div class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <span>${doc.country}</span>
      </div>
      ${doc.sector ? `
      <div class="meta-item">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
        <span>${doc.sector}</span>
      </div>
      ` : ''}
    </div>
    ${doc.description ? `
    <div class="description-container">
      <div class="description-wrapper">
        <p class="document-description">${doc.description}</p>
      </div>
      <button class="expand-description" aria-label="Expand description">
        <span class="arrow">⌄</span>
      </button>
    </div>
    ` : ''}
    <div class="document-footer">
      <div class="document-source">${doc.source || 'Source not specified'}</div>
      ${doc.link ? `
      <a href="${doc.link}" target="_blank" rel="noopener noreferrer" class="download-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        View/Download
      </a>
      ` : '<span class="no-link">No link available</span>'}
    </div>
  `;
  
  // Add click handler for expand/collapse
  if (doc.description) {
    const expandBtn = card.querySelector('.expand-description');
    const descriptionWrapper = card.querySelector('.description-wrapper');
    
    expandBtn.addEventListener('click', () => {
      descriptionWrapper.classList.toggle('expanded');
      expandBtn.classList.toggle('expanded');
    });
  }
  
  return card;
}

// Policy Analysis Functionality
let allPolicyData = [];
let selectedCountries = new Set();

async function loadPolicyAnalysis() {
  const loading = document.getElementById('policy-loading');
  const errorDiv = document.getElementById('policy-error');
  
  try {
    loading.style.display = 'block';
    errorDiv.textContent = '';
    
    const response = await fetch('http://localhost:3000/api/policy-analysis');
    
    if (!response.ok) {
      throw new Error('Failed to fetch policy analysis data');
    }
    
    allPolicyData = await response.json();
    
    loading.style.display = 'none';
    
    // Sort by overall_index descending
    allPolicyData.sort((a, b) => b.overall_index - a.overall_index);
    
    // Initialize country filter
    initializeCountryFilter();
    
    // Display all countries initially
    selectedCountries = new Set(allPolicyData.map(p => p.country));
    updatePolicyDisplay();
    
  } catch (error) {
    loading.style.display = 'none';
    errorDiv.textContent = `Error loading policy analysis: ${error.message}`;
    errorDiv.classList.add('show');
    console.error('Policy analysis error:', error);
  }
}

function initializeCountryFilter() {
  const filterGrid = document.getElementById('country-filter-grid');
  const selectAllBtn = document.getElementById('select-all-countries');
  const clearAllBtn = document.getElementById('clear-all-countries');
  
  filterGrid.innerHTML = '';
  
  allPolicyData.forEach(policy => {
    const checkboxDiv = document.createElement('div');
    checkboxDiv.className = 'country-checkbox';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `country-${policy.country.replace(/\s+/g, '-')}`;
    checkbox.value = policy.country;
    checkbox.checked = true;
    
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = policy.country;
    
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selectedCountries.add(policy.country);
      } else {
        selectedCountries.delete(policy.country);
      }
      updatePolicyDisplay();
    });
    
    checkboxDiv.appendChild(checkbox);
    checkboxDiv.appendChild(label);
    filterGrid.appendChild(checkboxDiv);
  });
  
  // Select All button
  selectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.country-checkbox input[type="checkbox"]').forEach(cb => {
      cb.checked = true;
      selectedCountries.add(cb.value);
    });
    updatePolicyDisplay();
  });
  
  // Clear All button
  clearAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.country-checkbox input[type="checkbox"]').forEach(cb => {
      cb.checked = false;
    });
    selectedCountries.clear();
    updatePolicyDisplay();
  });
}

function updatePolicyDisplay() {
  const grid = document.getElementById('policy-grid');
  grid.innerHTML = '';
  
  const filteredData = allPolicyData.filter(policy => selectedCountries.has(policy.country));
  
  if (filteredData.length === 0) {
    grid.innerHTML = '<div class="no-results">No countries selected. Please select at least one country to view policy analysis.</div>';
    return;
  }
  
  filteredData.forEach(policy => {
    const card = createPolicyCard(policy);
    grid.appendChild(card);
  });
}

function createPolicyCard(policy) {
  const card = document.createElement('div');
  card.className = 'policy-card';
  
  const classification = getClassification(policy.overall_index);
  
  card.innerHTML = `
    <div class="policy-card-header">
      <h3 class="policy-country">${policy.country}</h3>
      <span class="ndc-badge ${classification.class}">${classification.label}</span>
    </div>
    
    <div class="policy-score-main">
      <div class="overall-score ${classification.class}">
        <span class="score-value">${policy.overall_index}</span>
        <span class="score-label">Overall Index</span>
      </div>
    </div>
    
    <div class="policy-scores">
      <div class="score-item">
        <div class="score-bar-container">
          <div class="score-bar ${getScoreColor(policy.governance_score)}" style="width: ${policy.governance_score}%"></div>
        </div>
        <div class="score-info">
          <span class="score-name">Governance</span>
          <span class="score-number">${policy.governance_score}</span>
        </div>
      </div>
      
      <div class="score-item">
        <div class="score-bar-container">
          <div class="score-bar ${getScoreColor(policy.mitigation_score)}" style="width: ${policy.mitigation_score}%"></div>
        </div>
        <div class="score-info">
          <span class="score-name">Mitigation</span>
          <span class="score-number">${policy.mitigation_score}</span>
        </div>
      </div>
      
      <div class="score-item">
        <div class="score-bar-container">
          <div class="score-bar ${getScoreColor(policy.adaptation_score)}" style="width: ${policy.adaptation_score}%"></div>
        </div>
        <div class="score-info">
          <span class="score-name">Adaptation</span>
          <span class="score-number">${policy.adaptation_score}</span>
        </div>
      </div>
    </div>
    
    <div class="policy-source">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
      </svg>
      ${policy.source}
    </div>
  `;
  
  return card;
}

function getClassification(score) {
  if (score >= 80) {
    return { class: 'outstanding', label: 'Outstanding' };
  } else if (score >= 70) {
    return { class: 'satisfactory', label: 'Satisfactory' };
  } else if (score >= 55) {
    return { class: 'good', label: 'Good' };
  } else if (score >= 40) {
    return { class: 'average', label: 'Average' };
  } else {
    return { class: 'poor', label: 'Poor' };
  }
}

function getScoreColor(score) {
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}



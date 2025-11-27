// Interactive Climate Map with Leaflet.js
let map;
let policyData = [];
let geoJsonLayer;

// Country name mapping (GeoJSON shapeName to our database names)
const countryMapping = {
  'Republic of Kenya': 'Kenya',
  'Kenya': 'Kenya',
  'United Republic of Tanzania': 'Tanzania',
  'Tanzania': 'Tanzania',
  'Republic of Uganda': 'Uganda',
  'Uganda': 'Uganda',
  'Republic of Rwanda': 'Rwanda',
  'Rwanda': 'Rwanda',
  'Republic of Burundi': 'Burundi',
  'Burundi': 'Burundi',
  'Republic of South Sudan': 'South Sudan',
  'South Sudan': 'South Sudan',
  'Democratic Republic of the Congo': 'Democratic Republic of Congo (DRC)',
  'Dem. Rep. Congo': 'Democratic Republic of Congo (DRC)',
  'Federal Republic of Somalia': 'Somalia',
  'Somalia': 'Somalia'
};

// ISO country codes for EAC countries (ISO_A3 codes from Natural Earth)
const eacCountryCodes = ['KEN', 'TZA', 'UGA', 'RWA', 'BDI', 'SSD', 'COD', 'SOM'];

// Unique colors for each country
const countryColors = {
  'Kenya': '#FF6B6B',   
  'Tanzania': '#4ECDC4', 
  'Uganda': '#FFD93D',
  'Rwanda': '#0c53f8ff',
  'Burundi': '#dd9d14ff',
  'South Sudan': '#AA96DA',
  'Democratic Republic of Congo (DRC)': '#6C5CE7',
  'Somalia': '#FD79A8'          
};

async function initializeMap() {
  const loading = document.getElementById('map-loading');
  const errorDiv = document.getElementById('map-error');
  
  try {
    loading.style.display = 'block';
    
    // Initialize Leaflet map centered on East Africa
    map = L.map('climate-map', {
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      minZoom: 4,
      maxZoom: 8
    }).setView([-1.5, 34.0], 5); // Centered on East Africa
    
    // Add tile layer (CartoDB Positron - clean and light)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
    
    // Fetch policy analysis data
    const policyResponse = await fetch('/api/policy-analysis');
    policyData = await policyResponse.json();
    
    // List of individual country GeoJSON files
    const countryFiles = [
      '/data/geojason/Kenya_ADM0_simplified.simplified.geojson',
      '/data/geojason/Tanzania_ADM0_simplified.simplified.geojson',
      '/data/geojason/Uganda_ADM0_simplified.simplified.geojson',
      '/data/geojason/Rwanda_ADM0_simplified.simplified.geojson',
      '/data/geojason/Burundi_ADM0_simplified.simplified.geojson',
      '/data/geojason/South_Sudan_ADM0_simplified.simplified.geojson',
      '/data/geojason/DR_Congo_ADM0_simplified.simplified.geojson',
      '/data/geojason/Somalia_ADM0_simplified.simplified.geojson'
    ];
    
    // Fetch all country GeoJSON files in parallel
    const geoPromises = countryFiles.map(file => 
      fetch(file)
        .then(res => {
          if (!res.ok) throw new Error(`Failed to load ${file}`);
          return res.json();
        })
    );
    const geoDataArray = await Promise.all(geoPromises);
    
    console.log('Loaded GeoJSON files:', geoDataArray.length);
    
    // Combine all features into one FeatureCollection
    const eacGeoData = {
      type: 'FeatureCollection',
      features: geoDataArray.flatMap(data => {
        if (data.features && Array.isArray(data.features)) {
          return data.features;
        }
        return [];
      })
    };
    
    console.log('Total features:', eacGeoData.features.length);
    
    // Add GeoJSON layer with styling
    geoJsonLayer = L.geoJSON(eacGeoData, {
      style: styleCountry,
      onEachFeature: onEachCountry
    }).addTo(map);
    
    // Fit map to EAC bounds
    map.fitBounds(geoJsonLayer.getBounds(), { padding: [20, 20] });
    
    // Initialize close button
    initializeCloseButton();
    
    loading.style.display = 'none';
    
  } catch (error) {
    loading.style.display = 'none';
    errorDiv.textContent = `Error loading map: ${error.message}`;
    errorDiv.classList.add('show');
    console.error('Map initialization error:', error);
  }
}

// Get policy data for a country
function getCountryPolicyData(countryName) {
  const mappedName = countryMapping[countryName];
  return policyData.find(p => p.country === mappedName || p.country === countryName);
}

// Get color based on country name (unique color per country)
function getColor(countryName) {
  return countryColors[countryName] || '#9ca3af'; // Default gray if country not found
}

// Get classification based on score
function getClassification(score) {
  if (!score) return { class: 'no-data', label: 'No Data' };
  if (score >= 80) return { class: 'outstanding', label: 'Outstanding' };
  if (score >= 70) return { class: 'satisfactory', label: 'Satisfactory' };
  if (score >= 55) return { class: 'good', label: 'Good' };
  if (score >= 40) return { class: 'average', label: 'Average' };
  return { class: 'poor', label: 'Poor' };
}

// Get score color class
function getScoreColor(score) {
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
}

// Style function for countries
function styleCountry(feature) {
  const countryName = feature.properties.shapeName || feature.properties.NAME || feature.properties.ADMIN;
  const policyInfo = getCountryPolicyData(countryName);
  const mappedName = countryMapping[countryName] || countryName;
  const color = getColor(mappedName);
  
  return {
    fillColor: color,
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

// Add interactivity to each country
function onEachCountry(feature, layer) {
  const countryName = feature.properties.shapeName || feature.properties.NAME || feature.properties.ADMIN;
  const policyInfo = getCountryPolicyData(countryName);
  
  // Hover effect
  layer.on({
    mouseover: function(e) {
      const layer = e.target;
      layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.9
      });
      layer.bringToFront();
      
      // Show tooltip
      if (policyInfo) {
        // Calculate ranking
        const sortedData = [...policyData].sort((a, b) => b.overall_index - a.overall_index);
        const rank = sortedData.findIndex(p => p.country === policyInfo.country) + 1;
        
        layer.bindTooltip(`
          <div style="text-align: center;">
            <strong style="font-size: 1rem; display: block; margin-bottom: 0.5rem;">${policyInfo.country}</strong>
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="font-weight: 600;">Overall Index:</span>
              <span style="font-size: 1.1rem; font-weight: 700;">${policyInfo.overall_index}</span>
            </div>
            <div style="font-size: 0.8rem; color: #6b7280; font-weight: 600;">Rank #${rank} out of ${policyData.length}</div>
          </div>
        `, {
          permanent: false,
          sticky: true,
          className: 'country-tooltip'
        }).openTooltip();
      }
    },
    mouseout: function(e) {
      geoJsonLayer.resetStyle(e.target);
      e.target.closeTooltip();
    },
    click: function(e) {
      if (policyInfo) {
        showCountryInfo(policyInfo);
      }
    }
  });
}

// Show detailed country information in the info panel
function showCountryInfo(policy) {
  const infoPanel = document.getElementById('map-info-panel');
  const countryName = document.getElementById('info-country-name');
  const content = document.getElementById('info-panel-content');
  
  const classification = getClassification(policy.overall_index);
  
  // Calculate ranking (1-8 based on overall_index)
  const sortedData = [...policyData].sort((a, b) => b.overall_index - a.overall_index);
  const rank = sortedData.findIndex(p => p.country === policy.country) + 1;
  
  countryName.textContent = policy.country;
  
  content.innerHTML = `
    <div class="info-overall-score">
      <div class="info-score-badge ${classification.class}">
        <span class="info-score-value">${policy.overall_index}</span>
        <span class="info-score-label">Overall Index</span>
      </div>
      <div class="info-classification ${classification.class}">${classification.label}</div>
    </div>
    
    <div class="info-ranking">
      <div class="info-ranking-label">Regional Ranking</div>
      <div class="info-ranking-value">#${rank} of ${policyData.length} EAC Countries</div>
    </div>
    
    <div style="margin: 1rem 0; padding: 1rem; background: #f9fafb; border-radius: 0.5rem;">
      <h4 style="margin: 0 0 0.75rem 0; font-size: 0.875rem; font-weight: 700; color: #374151;">NDC Classification</h4>
      <table style="width: 100%; font-size: 0.75rem; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #e5e7eb;">
            <th style="text-align: left; padding: 0.5rem 0.25rem; font-weight: 600; color: #6b7280;">Category</th>
            <th style="text-align: right; padding: 0.5rem 0.25rem; font-weight: 600; color: #6b7280;">Score Range</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 0.5rem 0.25rem;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981; margin-right: 0.5rem;"></span>Outstanding</td>
            <td style="text-align: right; padding: 0.5rem 0.25rem; font-weight: 600;">80+</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 0.5rem 0.25rem;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #3b82f6; margin-right: 0.5rem;"></span>Satisfactory</td>
            <td style="text-align: right; padding: 0.5rem 0.25rem; font-weight: 600;">70 - 79</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 0.5rem 0.25rem;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #d5d3d3; margin-right: 0.5rem;"></span>Good</td>
            <td style="text-align: right; padding: 0.5rem 0.25rem; font-weight: 600;">55 - 69</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 0.5rem 0.25rem;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f59e0b; margin-right: 0.5rem;"></span>Average</td>
            <td style="text-align: right; padding: 0.5rem 0.25rem; font-weight: 600;">40 - 54</td>
          </tr>
          <tr>
            <td style="padding: 0.5rem 0.25rem;"><span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444; margin-right: 0.5rem;"></span>Poor</td>
            <td style="text-align: right; padding: 0.5rem 0.25rem; font-weight: 600;">Below 40</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="info-scores-list">
      <div class="info-score-row">
        <div class="info-score-header">
          <span class="info-score-name">Governance</span>
          <span class="info-score-number">${policy.governance_score}</span>
        </div>
        <div class="info-score-bar">
          <div class="info-score-fill ${getScoreColor(policy.governance_score)}" style="width: ${policy.governance_score}%"></div>
        </div>
      </div>
      
      <div class="info-score-row">
        <div class="info-score-header">
          <span class="info-score-name">Mitigation</span>
          <span class="info-score-number">${policy.mitigation_score}</span>
        </div>
        <div class="info-score-bar">
          <div class="info-score-fill ${getScoreColor(policy.mitigation_score)}" style="width: ${policy.mitigation_score}%"></div>
        </div>
      </div>
      
      <div class="info-score-row">
        <div class="info-score-header">
          <span class="info-score-name">Adaptation</span>
          <span class="info-score-number">${policy.adaptation_score}</span>
        </div>
        <div class="info-score-bar">
          <div class="info-score-fill ${getScoreColor(policy.adaptation_score)}" style="width: ${policy.adaptation_score}%"></div>
        </div>
      </div>
    </div>
    
    <div class="info-source">
      <strong>Source:</strong> ${policy.source}
    </div>
  `;
  
  infoPanel.classList.add('active');
}

// Initialize close button
function initializeCloseButton() {
  const closeBtn = document.getElementById('close-info-panel');
  const infoPanel = document.getElementById('map-info-panel');
  
  if (closeBtn && infoPanel) {
    // Remove any existing listeners
    const newCloseBtn = closeBtn.cloneNode(true);
    closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
    
    // Add fresh listener
    newCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      infoPanel.classList.remove('active');
      console.log('Close button clicked');
    });
  }
}

// Close info panel
document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-info-panel');
  const infoPanel = document.getElementById('map-info-panel');
  
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      infoPanel.classList.remove('active');
    });
  }
});

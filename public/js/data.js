// ═══════════════════════════════════════════════════════════════════════════
// DATA MANAGER — Data Loading and Processing
// Authors: GOUBGOU & MOHAMMED
// ═══════════════════════════════════════════════════════════════════════════

const Data = {
  // Raw data array
  raw: [],
  
  // Unique countries list
  countries: [],
  
  // Years range
  minYear: 1980,
  maxYear: 2024,
  
  // Group colors
  groupColors: {
    1: "#3b82f6", // G7 - Blue
    2: "#ef4444", // BRICS - Red
    3: "#22c55e"  // Autres - Green
  },
  
  // Group labels
  groupLabels: {
    1: "G7",
    2: "BRICS",
    3: "Autres"
  },
  
  // Country short names
  shortNames: {
    "Russian Federation": "Russie",
    "United Kingdom": "UK",
    "South Africa": "Afr. du Sud",
    "United States": "USA"
  },
  
  // Country centroids for map
  centroids: {
    "USA": [-95, 38],
    "China": [105, 35],
    "India": [78, 22],
    "Japan": [138, 36],
    "Germany": [10, 51],
    "France": [2, 47],
    "United Kingdom": [-2, 54],
    "Italy": [12, 43],
    "Canada": [-106, 56],
    "Brazil": [-53, -10],
    "Russian Federation": [100, 60],
    "South Africa": [25, -29],
    "Mexico": [-102, 24],
    "Indonesia": [120, -2],
    "Nigeria": [8, 10],
    "Bangladesh": [90, 24],
    "Ethiopia": [39, 9],
    "Kenya": [38, 1],
    "Tanzania": [35, -6]
  },
  
  // Historical events
  events: [
    { year: 1991, label: "Chute URSS", description: "Effondrement de l'Union soviétique" },
    { year: 2001, label: "Chine → OMC", description: "Adhésion de la Chine à l'OMC" },
    { year: 2008, label: "Crise financière", description: "Crise des subprimes" },
    { year: 2020, label: "COVID-19", description: "Pandémie mondiale" }
  ],
  
  // Get short name for country
  getShortName(country) {
    return this.shortNames[country] || country;
  },
  
  // Calculate bubble radius from population
  getPopRadius(pop) {
    return Math.max(5, Math.sqrt(pop / 1e6) * 1.8);
  },
  
  // Load CSV data
  async load(path = "data/combined_data.csv") {
    try {
      const response = await d3.csv(path, d => ({
        year: +d.Year,
        country: d.Country,
        gdp: +d.GDP_per_capita,
        gini: +d.Gini_Index,
        top10: +d.Top_10_Income_Share,
        bot50: +d.Bottom_50_Income_Share,
        top10w: +d.Top_10_Wealth_Share,
        pop: +d.Total_Population,
        group: +d.Group
      }));
      
      this.raw = response;
      this.countries = [...new Set(response.map(d => d.country))].sort();
      this.minYear = d3.min(response, d => d.year);
      this.maxYear = d3.max(response, d => d.year);
      
      return this.raw;
    } catch (error) {
      console.error("Erreur de chargement des données:", error);
      return [];
    }
  },
  
  // Filter data by state
  filter(state, year = null) {
    const targetYear = year !== null ? year : state.year;
    let filtered = this.raw.filter(d => d.year === targetYear);
    
    // Filter by active groups
    filtered = filtered.filter(d => state.groups.includes(d.group));
    
    // Filter by selected countries (respecting group filter)
    if (state.selectedCountries.length > 0) {
      filtered = filtered.filter(d => state.selectedCountries.includes(d.country));
    }
    
    return filtered;
  },
  
  // Get all data for a specific country
  getCountryHistory(country) {
    return this.raw.filter(d => d.country === country).sort((a, b) => a.year - b.year);
  },
  
  // Get data for multiple years
  getYearsData(years, state) {
    return this.raw.filter(d => 
      years.includes(d.year) && 
      state.groups.includes(d.group) &&
      (state.selectedCountries.length === 0 || state.selectedCountries.includes(d.country))
    );
  },
  
  // Calculate group averages by year
  getGroupAverages() {
    const byYearGroup = {};
    
    this.raw.forEach(d => {
      const key = `${d.year}_${d.group}`;
      if (!byYearGroup[key]) {
        byYearGroup[key] = { giniSum: 0, gdpSum: 0, count: 0, year: d.year, group: d.group };
      }
      byYearGroup[key].giniSum += d.gini;
      byYearGroup[key].gdpSum += d.gdp;
      byYearGroup[key].count++;
    });
    
    return Object.values(byYearGroup).map(d => ({
      year: d.year,
      group: d.group,
      giniAvg: d.giniSum / d.count,
      gdpAvg: d.gdpSum / d.count
    }));
  },
  
  // Get statistics for current selection
  getStats(state) {
    const data = this.filter(state);
    if (data.length === 0) return null;
    
    const highestGDP = data.reduce((a, b) => a.gdp > b.gdp ? a : b);
    const lowestGDP = data.reduce((a, b) => a.gdp < b.gdp ? a : b);
    const highestGini = data.reduce((a, b) => a.gini > b.gini ? a : b);
    const lowestGini = data.reduce((a, b) => a.gini < b.gini ? a : b);
    
    const avgGini = d3.mean(data, d => d.gini);
    const avgGDP = d3.mean(data, d => d.gdp);
    
    // Group averages
    const groupStats = {};
    [1, 2, 3].forEach(g => {
      const groupData = data.filter(d => d.group === g);
      if (groupData.length > 0) {
        groupStats[g] = {
          avgGini: d3.mean(groupData, d => d.gini),
          avgGDP: d3.mean(groupData, d => d.gdp),
          count: groupData.length
        };
      }
    });
    
    return {
      highestGDP,
      lowestGDP,
      highestGini,
      lowestGini,
      avgGini,
      avgGDP,
      groupStats,
      totalCountries: data.length
    };
  },
  
  // Get countries by group
  getCountriesByGroup(groupId) {
    return [...new Set(this.raw.filter(d => d.group === groupId).map(d => d.country))];
  }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Data;
}

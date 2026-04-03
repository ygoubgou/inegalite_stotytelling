// ═══════════════════════════════════════════════════════════════════════════
// STATE MANAGER — Global State for Dashboard
// Authors: GOUBGOU & MOHAMMED
// ═══════════════════════════════════════════════════════════════════════════

const State = {
  // Current year for animation
  year: 1980,
  
  // Active groups: 1=G7, 2=BRICS, 3=Autres
  groups: [1, 2, 3],
  
  // Selected countries (empty = all)
  selectedCountries: [],
  
  // Animation state
  isPlaying: false,
  animationSpeed: 150, // ms between frames
  
  // Current story step
  currentStep: null,
  
  // Theme: 'dark' or 'light'
  theme: 'dark',
  
  // Highlighted country (hover/click)
  highlightedCountry: null,
  
  // Subscribers for state changes
  _subscribers: [],
  
  // Subscribe to state changes
  subscribe(callback) {
    this._subscribers.push(callback);
    return () => {
      this._subscribers = this._subscribers.filter(cb => cb !== callback);
    };
  },
  
  // Notify all subscribers
  notify(key, value) {
    this._subscribers.forEach(cb => cb(key, value, this));
  },
  
  // Set year
  setYear(year) {
    this.year = year;
    this.notify('year', year);
  },
  
  // Toggle group
  toggleGroup(groupId) {
    const idx = this.groups.indexOf(groupId);
    if (idx > -1) {
      this.groups.splice(idx, 1);
    } else {
      this.groups.push(groupId);
      this.groups.sort();
    }
    this.notify('groups', this.groups);
  },
  
  // Set groups
  setGroups(groups) {
    this.groups = [...groups];
    this.notify('groups', this.groups);
  },
  
  // Add country to selection
  addCountry(country) {
    if (!this.selectedCountries.includes(country)) {
      this.selectedCountries.push(country);
      this.notify('selectedCountries', this.selectedCountries);
    }
  },
  
  // Remove country from selection
  removeCountry(country) {
    this.selectedCountries = this.selectedCountries.filter(c => c !== country);
    this.notify('selectedCountries', this.selectedCountries);
  },
  
  // Clear country selection
  clearCountries() {
    this.selectedCountries = [];
    this.notify('selectedCountries', this.selectedCountries);
  },
  
  // Set highlighted country
  setHighlightedCountry(country) {
    this.highlightedCountry = country;
    this.notify('highlightedCountry', country);
  },
  
  // Set theme
  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.notify('theme', theme);
  },
  
  // Toggle theme
  toggleTheme() {
    this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
  },
  
  // Set playing state
  setPlaying(playing) {
    this.isPlaying = playing;
    this.notify('isPlaying', playing);
  },
  
  // Set animation speed
  setSpeed(speed) {
    this.animationSpeed = speed;
    this.notify('animationSpeed', speed);
  },
  
  // Set current step
  setStep(step) {
    this.currentStep = step;
    this.notify('currentStep', step);
  },
  
  // Initialize from localStorage
  init() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = State;
}

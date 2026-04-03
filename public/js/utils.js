// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES — Helper Functions
// Authors: GOUBGOU & MOHAMMED
// ═══════════════════════════════════════════════════════════════════════════

const Utils = {
  // Format number with locale
  formatNumber(num, decimals = 0) {
    return num.toLocaleString('fr-FR', { maximumFractionDigits: decimals });
  },
  
  // Format currency
  formatCurrency(num) {
    if (num >= 1e6) {
      return `$${(num / 1e6).toFixed(1)}M`;
    } else if (num >= 1e3) {
      return `$${(num / 1e3).toFixed(1)}k`;
    }
    return `$${num.toFixed(0)}`;
  },
  
  // Format population
  formatPopulation(pop) {
    if (pop >= 1e9) {
      return `${(pop / 1e9).toFixed(2)} Mrd`;
    } else if (pop >= 1e6) {
      return `${(pop / 1e6).toFixed(1)} M`;
    }
    return `${(pop / 1e3).toFixed(0)} k`;
  },
  
  // Format percentage
  formatPercent(value, decimals = 1) {
    return `${(value * 100).toFixed(decimals)}%`;
  },
  
  // Calculate Pearson correlation coefficient
  correlation(x, y) {
    const n = x.length;
    if (n !== y.length || n < 3) return null;
    
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;
    
    const numerator = x.reduce((sum, xi, i) => sum + (xi - meanX) * (y[i] - meanY), 0);
    const denomX = Math.sqrt(x.reduce((sum, xi) => sum + (xi - meanX) ** 2, 0));
    const denomY = Math.sqrt(y.reduce((sum, yi) => sum + (yi - meanY) ** 2, 0));
    
    if (denomX === 0 || denomY === 0) return null;
    return numerator / (denomX * denomY);
  },
  
  // Debounce function
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Throttle function
  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },
  
  // Linear interpolation
  lerp(start, end, t) {
    return start + (end - start) * t;
  },
  
  // Clamp value between min and max
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },
  
  // Get CSS variable value
  getCSSVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  },
  
  // Set CSS variable
  setCSSVar(name, value) {
    document.documentElement.style.setProperty(name, value);
  },
  
  // Check if element is in viewport
  isInViewport(element, threshold = 0.5) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    return visibleHeight / rect.height >= threshold;
  },
  
  // Download SVG as PNG
  downloadSVGAsPNG(svgElement, filename = 'chart.png') {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.scale(2, 2);
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  },
  
  // Create tooltip HTML
  createTooltipHTML(d, groupColors, shortName) {
    return `
      <div class="tooltip-title">
        <span class="tooltip-dot" style="background:${groupColors[d.group]}"></span>
        ${d.country}
      </div>
      <div class="tooltip-row"><span>Année</span><span>${d.year}</span></div>
      <div class="tooltip-row"><span>PIB/hab</span><span>${this.formatCurrency(d.gdp)}</span></div>
      <div class="tooltip-row"><span>Gini</span><span>${d.gini.toFixed(3)}</span></div>
      <div class="tooltip-row"><span>Top 10%</span><span>${this.formatPercent(d.top10)}</span></div>
      <div class="tooltip-row"><span>Bottom 50%</span><span>${this.formatPercent(d.bot50)}</span></div>
      <div class="tooltip-row"><span>Population</span><span>${this.formatPopulation(d.pop)}</span></div>
    `;
  }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}

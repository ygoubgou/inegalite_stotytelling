// ═══════════════════════════════════════════════════════════════════════════
// MAIN.JS — Scrollytelling Application Entry Point
// Authors: GOUBGOU & MOHAMMED
// ═══════════════════════════════════════════════════════════════════════════

// ═══ CONSTANTS ═══
const ANIMATION_SPEED = 1000; // Fixed animation speed in ms

// ═══ TOOLTIP MANAGER ═══
const Tooltip = {
  el: null,
  
  init() {
    this.el = document.getElementById("tooltip");
  },
  
  show(event, d) {
    if (!this.el) return;
    
    this.el.innerHTML = Utils.createTooltipHTML(d, Data.groupColors, Data.getShortName(d.country));
    this.el.classList.add("visible");
    
    const rect = this.el.getBoundingClientRect();
    let x = event.pageX + 15;
    let y = event.pageY - 10;
    
    if (x + rect.width > window.innerWidth) x = event.pageX - rect.width - 15;
    if (y + rect.height > window.innerHeight) y = event.pageY - rect.height - 10;
    
    this.el.style.left = x + "px";
    this.el.style.top = y + "px";
  },
  
  hide() {
    if (this.el) {
      this.el.classList.remove("visible");
    }
  }
};

// ═══ SCROLLYTELLING VISUALIZATION ═══
const StoryViz = {
  svg: null,
  width: 640,
  height: 480,
  margin: { top: 50, right: 50, bottom: 60, left: 80 },
  currentStep: null,
  animationInterval: null,
  
  init() {
    this.svg = d3.select("#mainViz")
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Create base groups
    this.svg.append("g").attr("class", "grid-lines");
    this.svg.append("g").attr("class", "x-axis");
    this.svg.append("g").attr("class", "y-axis");
    this.svg.append("g").attr("class", "events-group");
    this.svg.append("g").attr("class", "lines-group");
    this.svg.append("g").attr("class", "bubbles-group");
    this.svg.append("g").attr("class", "labels-group");
    this.svg.append("g").attr("class", "bars-group");
    this.svg.append("text").attr("class", "x-label");
    this.svg.append("text").attr("class", "y-label");
    this.svg.append("text").attr("class", "year-watermark");
    this.svg.append("text").attr("class", "chart-title");
  },
  
  // Stop any running animation
  stopAnimation() {
    if (this.animationInterval) {
      clearInterval(this.animationInterval);
      this.animationInterval = null;
    }
  },
  
  // Clear visualization
  clear() {
    this.stopAnimation();
    this.svg.select(".grid-lines").selectAll("*").remove();
    this.svg.select(".x-axis").selectAll("*").remove();
    this.svg.select(".y-axis").selectAll("*").remove();
    this.svg.select(".events-group").selectAll("*").remove();
    this.svg.select(".lines-group").selectAll("*").remove();
    this.svg.select(".bubbles-group").selectAll("*").remove();
    this.svg.select(".labels-group").selectAll("*").remove();
    this.svg.select(".bars-group").selectAll("*").remove();
    this.svg.select(".x-label").text("");
    this.svg.select(".y-label").text("");
    this.svg.select(".year-watermark").text("");
    this.svg.select(".chart-title").text("");
  },
  
  // Create scales for scatter plot
  getScatterScales() {
    const { margin, width, height } = this;
    
    const xScale = d3.scaleLog()
      .domain([150, 120000])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0.2, 0.75])
      .range([height - margin.bottom, margin.top]);
    
    return { xScale, yScale };
  },
  
  // Create scales for trajectory (year on x-axis)
  getTrajectoryScales() {
    const { margin, width, height } = this;
    
    const xScale = d3.scaleLinear()
      .domain([1980, 2024])
      .range([margin.left, width - margin.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0.2, 0.75])
      .range([height - margin.bottom, margin.top]);
    
    return { xScale, yScale };
  },
  
  // Draw scatter axes
  drawScatterAxes() {
    const { svg, margin, width, height } = this;
    const { xScale, yScale } = this.getScatterScales();
    
    // Grid lines
    const gridGroup = svg.select(".grid-lines");
    yScale.ticks(6).forEach(tick => {
      gridGroup.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScale(tick))
        .attr("y2", yScale(tick))
        .attr("class", "grid-line");
    });
    
    // X axis
    const xAxis = d3.axisBottom(xScale)
      .tickValues([200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000])
      .tickFormat(d => d >= 1000 ? `${d/1000}k` : d);
    
    svg.select(".x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .selectAll("text")
      .attr("class", "axis");
    
    // Y axis
    svg.select(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .selectAll("text")
      .attr("class", "axis");
    
    // Labels
    svg.select(".x-label")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("PIB par habitant ($, échelle log)");
    
    svg.select(".y-label")
      .attr("x", -height / 2)
      .attr("y", 22)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Indice de Gini");
  },
  
  // Draw trajectory axes (year on x)
  drawTrajectoryAxes() {
    const { svg, margin, width, height } = this;
    const { xScale, yScale } = this.getTrajectoryScales();
    
    // Grid lines
    const gridGroup = svg.select(".grid-lines");
    yScale.ticks(6).forEach(tick => {
      gridGroup.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScale(tick))
        .attr("y2", yScale(tick))
        .attr("class", "grid-line");
    });
    
    // X axis
    svg.select(".x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(9).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("class", "axis");
    
    // Y axis
    svg.select(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .selectAll("text")
      .attr("class", "axis");
    
    // Labels
    svg.select(".x-label")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Année");
    
    svg.select(".y-label")
      .attr("x", -height / 2)
      .attr("y", 22)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Indice de Gini");
  },
  
  // Draw historical events on trajectory
  drawEvents() {
    const { svg, margin, height } = this;
    const { xScale } = this.getTrajectoryScales();
    const eventsGroup = svg.select(".events-group");
    
    Data.events.forEach(event => {
      eventsGroup.append("line")
        .attr("x1", xScale(event.year))
        .attr("x2", xScale(event.year))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("class", "event-line")
        .attr("opacity", 0)
        .transition().duration(500)
        .attr("opacity", 0.6);
      
      eventsGroup.append("text")
        .attr("x", xScale(event.year) + 5)
        .attr("y", margin.top + 15)
        .attr("class", "event-label")
        .text(event.label)
        .attr("opacity", 0)
        .transition().delay(300).duration(300)
        .attr("opacity", 0.9);
    });
  },
  
  // Render scatter plot for a specific year
  renderScatter(year, animate = true) {
    const { svg } = this;
    const { xScale, yScale } = this.getScatterScales();
    
    // Update watermark
    svg.select(".year-watermark")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2 + 40)
      .attr("text-anchor", "middle")
      .text(year);
    
    // Update background year
    const yearBg = document.getElementById("vizYearBg");
    if (yearBg) yearBg.textContent = year;
    
    // Get data for year
    const data = Data.filter(State, year);
    
    // Bubbles
    const bubblesGroup = svg.select(".bubbles-group");
    const bubbles = bubblesGroup.selectAll("circle").data(data, d => d.country);
    
    // Enter
    bubbles.enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", d => xScale(Math.max(150, d.gdp)))
      .attr("cy", animate ? yScale(0.5) : d => yScale(d.gini))
      .attr("r", 0)
      .attr("fill", d => Data.groupColors[d.group])
      .attr("opacity", 0.85)
      .attr("stroke", "rgba(255,255,255,0.25)")
      .attr("stroke-width", 1)
      .on("mouseenter", function(e, d) {
        Tooltip.show(e, d);
        d3.select(this).raise();
      })
      .on("mouseleave", () => Tooltip.hide())
      .transition().duration(animate ? 800 : 0).delay((_, i) => animate ? i * 30 : 0)
      .attr("cy", d => yScale(d.gini))
      .attr("r", d => Data.getPopRadius(d.pop));
    
    // Update
    bubbles.transition().duration(animate ? ANIMATION_SPEED : 0).ease(d3.easeCubic)
      .attr("cx", d => xScale(Math.max(150, d.gdp)))
      .attr("cy", d => yScale(d.gini))
      .attr("r", d => Data.getPopRadius(d.pop));
    
    // Exit
    bubbles.exit()
      .transition().duration(300)
      .attr("r", 0)
      .remove();
    
    // Labels
    const labelsGroup = svg.select(".labels-group");
    const labels = labelsGroup.selectAll("text").data(data, d => d.country);
    
    labels.enter()
      .append("text")
      .attr("class", "country-label")
      .attr("x", d => xScale(Math.max(150, d.gdp)))
      .attr("y", d => yScale(d.gini) - Data.getPopRadius(d.pop) - 8)
      .text(d => Data.getShortName(d.country))
      .attr("opacity", 0)
      .transition().delay(animate ? 500 : 0).duration(400)
      .attr("opacity", 1);
    
    labels.transition().duration(animate ? ANIMATION_SPEED : 0)
      .attr("x", d => xScale(Math.max(150, d.gdp)))
      .attr("y", d => yScale(d.gini) - Data.getPopRadius(d.pop) - 8);
    
    labels.exit().remove();
  },
  
  // Render trajectory for specific countries
  renderTrajectory(countries, highlightCountry = null) {
    const { svg, width, margin } = this;
    const { xScale, yScale } = this.getTrajectoryScales();
    
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.gini))
      .curve(d3.curveCatmullRom);
    
    const linesGroup = svg.select(".lines-group");
    const labelsGroup = svg.select(".labels-group");
    
    countries.forEach((country, index) => {
      const history = Data.getCountryHistory(country);
      if (history.length === 0) return;
      
      const countryData = Data.raw.find(d => d.country === country);
      const color = Data.groupColors[countryData?.group || 3];
      const isHighlighted = !highlightCountry || country === highlightCountry;
      
      // Draw path
      const path = linesGroup.append("path")
        .datum(history)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", isHighlighted ? 3 : 2)
        .attr("opacity", isHighlighted ? 0.9 : 0.3);
      
      // Animate path
      const pathLength = path.node().getTotalLength();
      path.attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(1500)
        .delay(index * 150)
        .ease(d3.easeCubic)
        .attr("stroke-dashoffset", 0);
      
      // End dot
      const lastPoint = history[history.length - 1];
      linesGroup.append("circle")
        .attr("cx", xScale(lastPoint.year))
        .attr("cy", yScale(lastPoint.gini))
        .attr("r", 0)
        .attr("fill", color)
        .attr("opacity", isHighlighted ? 1 : 0.4)
        .transition()
        .delay(1500 + index * 150)
        .duration(300)
        .attr("r", isHighlighted ? 6 : 4);
      
      // Label
      labelsGroup.append("text")
        .attr("x", width - margin.right + 8)
        .attr("y", yScale(lastPoint.gini))
        .attr("class", "trajectory-label")
        .attr("fill", color)
        .attr("dominant-baseline", "middle")
        .attr("font-size", isHighlighted ? "12px" : "10px")
        .attr("font-weight", isHighlighted ? "600" : "500")
        .attr("opacity", 0)
        .text(Data.getShortName(country))
        .transition()
        .delay(1500 + index * 150)
        .duration(300)
        .attr("opacity", isHighlighted ? 1 : 0.5);
    });
  },
  
  // Render ranking chart
  renderRanking(year) {
    const { svg, margin, width, height } = this;
    
    // Get top 12 by Gini
    const data = Data.filter(State, year)
      .sort((a, b) => b.gini - a.gini)
      .slice(0, 12);
    
    // Update watermark
    svg.select(".year-watermark")
      .attr("x", width / 2)
      .attr("y", height / 2 + 40)
      .attr("text-anchor", "middle")
      .text(year);
    
    // Update background year
    const yearBg = document.getElementById("vizYearBg");
    if (yearBg) yearBg.textContent = year;
    
    // Title
    svg.select(".chart-title")
      .attr("x", width / 2)
      .attr("y", margin.top - 15)
      .attr("text-anchor", "middle")
      .text("Top 12 — Indice de Gini le plus élevé");
    
    const barHeight = 28;
    const barGap = 8;
    const startY = margin.top + 20;
    const maxBarWidth = width - margin.left - margin.right - 120;
    
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.gini)])
      .range([0, maxBarWidth]);
    
    const barsGroup = svg.select(".bars-group");
    
    data.forEach((d, i) => {
      const y = startY + i * (barHeight + barGap);
      const barWidth = xScale(d.gini);
      
      // Bar background
      barsGroup.append("rect")
        .attr("x", margin.left)
        .attr("y", y)
        .attr("width", 0)
        .attr("height", barHeight)
        .attr("rx", 6)
        .attr("fill", Data.groupColors[d.group])
        .attr("opacity", 0.85)
        .transition()
        .duration(600)
        .delay(i * 60)
        .attr("width", barWidth);
      
      // Country name
      barsGroup.append("text")
        .attr("x", margin.left + barWidth + 12)
        .attr("y", y + barHeight / 2)
        .attr("class", "bar-label-left")
        .attr("dominant-baseline", "middle")
        .attr("opacity", 0)
        .text(Data.getShortName(d.country))
        .transition()
        .delay(600 + i * 60)
        .duration(300)
        .attr("opacity", 1);
      
      // Gini value
      barsGroup.append("text")
        .attr("x", width - margin.right)
        .attr("y", y + barHeight / 2)
        .attr("class", "bar-label-right")
        .attr("dominant-baseline", "middle")
        .attr("text-anchor", "end")
        .attr("opacity", 0)
        .text(d.gini.toFixed(3))
        .transition()
        .delay(600 + i * 60)
        .duration(300)
        .attr("opacity", 1);
      
      // Group dot
      barsGroup.append("circle")
        .attr("cx", margin.left - 12)
        .attr("cy", y + barHeight / 2)
        .attr("r", 5)
        .attr("fill", Data.groupColors[d.group])
        .attr("opacity", 0)
        .transition()
        .delay(300 + i * 60)
        .duration(300)
        .attr("opacity", 1);
    });
  },
  
  // Animate scatter plot through years
  animateYears(startYear, endYear, onComplete) {
    this.stopAnimation();
    
    let currentYear = startYear;
    
    this.animationInterval = setInterval(() => {
      this.renderScatter(currentYear, false);
      currentYear++;
      
      if (currentYear > endYear) {
        this.stopAnimation();
        if (onComplete) onComplete();
      }
    }, ANIMATION_SPEED);
  },
  
  // Render step based on step ID
  renderStep(stepId) {
    if (this.currentStep === stepId) return;
    this.currentStep = stepId;
    
    this.clear();
    
    switch(stepId) {
      case "intro":
        this.drawScatterAxes();
        this.renderScatter(1980, true);
        break;
        
      case "animate":
        this.drawScatterAxes();
        this.renderScatter(1980, false);
        setTimeout(() => {
          this.animateYears(1980, 1990);
        }, 500);
        break;
        
      case "fall-ussr":
        this.drawScatterAxes();
        this.renderScatter(1991, true);
        break;
        
      case "trajectory-russia":
        this.drawTrajectoryAxes();
        this.drawEvents();
        this.renderTrajectory(["Russian Federation", "USA", "China", "Japan"], "Russian Federation");
        break;
        
      case "china-wto":
        this.drawScatterAxes();
        this.renderScatter(2001, true);
        break;
        
      case "trajectory-china":
        this.drawTrajectoryAxes();
        this.drawEvents();
        this.renderTrajectory(["China", "India", "Brazil", "Russian Federation"], "China");
        break;
        
      case "crisis-2008":
        this.drawScatterAxes();
        this.renderScatter(2008, true);
        break;
        
      case "trajectory-g7":
        this.drawTrajectoryAxes();
        this.drawEvents();
        this.renderTrajectory(["USA", "United Kingdom", "Germany", "France", "Japan", "Italy", "Canada"]);
        break;
        
      case "covid":
        this.drawScatterAxes();
        this.renderScatter(2020, true);
        break;
        
      case "ranking":
        this.renderRanking(2024);
        break;
        
      case "today":
      case "conclusion":
        this.drawScatterAxes();
        this.renderScatter(2024, true);
        break;
        
      default:
        this.drawScatterAxes();
        this.renderScatter(State.year, true);
    }
  }
};

// ═══ UI CONTROLLER ═══
const UI = {
  init() {
    this.initThemeToggle();
    this.initFilterPanel();
    this.initGroupToggles();
    this.initCountrySearch();
    this.initYearSlider();
    this.initScrollytelling();
    this.initHeroAnimation();
  },
  
  initThemeToggle() {
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
      toggle.addEventListener("click", () => State.toggleTheme());
    }
  },
  
  initFilterPanel() {
    const panel = document.getElementById("filterPanel");
    const toggle = document.getElementById("toggleFilters");
    
    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        panel.classList.toggle("open");
      });
    }
  },
  
  initGroupToggles() {
    const toggles = document.querySelectorAll(".toggle-btn[data-group]");
    
    toggles.forEach(btn => {
      btn.addEventListener("click", () => {
        const groupId = parseInt(btn.dataset.group);
        btn.classList.toggle("active");
        State.toggleGroup(groupId);
      });
    });
  },
  
  initCountrySearch() {
    const input = document.getElementById("countrySearch");
    const dropdown = document.getElementById("countryDropdown");
    const clearBtn = document.getElementById("clearCountries");
    
    if (!input || !dropdown) return;
    
    const populateDropdown = (filter = "") => {
      dropdown.innerHTML = "";
      const filtered = Data.countries.filter(c => 
        c.toLowerCase().includes(filter.toLowerCase()) &&
        !State.selectedCountries.includes(c)
      );
      
      const activeGroupCountries = Data.raw
        .filter(d => State.groups.includes(d.group))
        .map(d => d.country);
      
      const available = filtered.filter(c => activeGroupCountries.includes(c));
      
      available.slice(0, 10).forEach(country => {
        const countryData = Data.raw.find(d => d.country === country);
        const div = document.createElement("div");
        div.className = "country-option";
        div.innerHTML = `
          <span class="option-dot" style="background:${Data.groupColors[countryData?.group || 3]}"></span>
          ${country}
        `;
        div.addEventListener("click", () => {
          State.addCountry(country);
          input.value = "";
          dropdown.classList.remove("show");
        });
        dropdown.appendChild(div);
      });
    };
    
    input.addEventListener("focus", () => {
      populateDropdown(input.value);
      dropdown.classList.add("show");
    });
    
    input.addEventListener("input", () => {
      populateDropdown(input.value);
    });
    
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".country-select")) {
        dropdown.classList.remove("show");
      }
    });
    
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        State.clearCountries();
      });
    }
  },
  
  updateSelectedCountries() {
    const container = document.getElementById("selectedCountries");
    if (!container) return;
    
    container.innerHTML = "";
    State.selectedCountries.forEach(country => {
      const tag = document.createElement("div");
      tag.className = "country-tag";
      tag.innerHTML = `
        ${Data.getShortName(country)}
        <button aria-label="Retirer ${country}">&times;</button>
      `;
      tag.querySelector("button").addEventListener("click", () => {
        State.removeCountry(country);
      });
      container.appendChild(tag);
    });
  },
  
  initYearSlider() {
    const slider = document.getElementById("yearSlider");
    const value = document.getElementById("yearValue");
    
    if (slider) {
      slider.addEventListener("input", () => {
        const year = parseInt(slider.value);
        State.setYear(year);
        if (value) value.textContent = year;
        
        // Re-render current step with new year (for scatter views)
        if (StoryViz.currentStep) {
          const currentStep = StoryViz.currentStep;
          if (["intro", "fall-ussr", "china-wto", "crisis-2008", "covid", "today", "conclusion"].includes(currentStep)) {
            StoryViz.clear();
            StoryViz.currentStep = null;
            StoryViz.drawScatterAxes();
            StoryViz.renderScatter(year, false);
          }
        }
      });
    }
  },
  
  updateYearDisplay(year) {
    const slider = document.getElementById("yearSlider");
    const value = document.getElementById("yearValue");
    
    if (slider) slider.value = year;
    if (value) value.textContent = year;
  },
  
  initScrollytelling() {
    const steps = document.querySelectorAll(".step");
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          const stepId = entry.target.dataset.step;
          if (stepId) {
            State.setStep(stepId);
            StoryViz.renderStep(stepId);
          }
        } else {
          entry.target.classList.remove("active");
        }
      });
    }, {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0
    });
    
    steps.forEach(step => observer.observe(step));
  },
  
  initHeroAnimation() {
    const heroYear = document.getElementById("heroBgYear");
    if (!heroYear) return;
    
    let year = 1980;
    setInterval(() => {
      year++;
      if (year > 2024) year = 1980;
      heroYear.textContent = year;
    }, 100);
  }
};

// ═══ STATE SUBSCRIBERS ═══
State.subscribe((key, value, state) => {
  switch(key) {
    case "year":
      UI.updateYearDisplay(value);
      break;
      
    case "groups":
      // Re-render if filter changes
      if (StoryViz.currentStep) {
        const step = StoryViz.currentStep;
        StoryViz.currentStep = null;
        StoryViz.renderStep(step);
      }
      break;
      
    case "selectedCountries":
      UI.updateSelectedCountries();
      break;
      
    case "theme":
      // Theme is handled by CSS variables
      break;
  }
});

// ═══ INITIALIZATION ═══
async function init() {
  // Initialize state
  State.init();
  
  // Initialize tooltip
  Tooltip.init();
  
  // Load data
  await Data.load();
  
  // Initialize story visualization
  StoryViz.init();
  
  // Initialize UI
  UI.init();
  
  // Initial render - intro step
  StoryViz.renderStep("intro");
  
  // Initial UI state
  UI.updateYearDisplay(State.year);
  UI.updateSelectedCountries();
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

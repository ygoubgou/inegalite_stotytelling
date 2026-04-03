// ═══════════════════════════════════════════════════════════════════════════
// MAIN.JS — Application Entry Point
// Authors: GOUBGOU & MOHAMMED
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══ ANIMATION CONTROLLER ═══
const Animation = {
  interval: null,
  
  start() {
    if (State.isPlaying) return;
    
    State.setPlaying(true);
    this.updatePlayButton();
    
    this.interval = setInterval(() => {
      let nextYear = State.year + 1;
      if (nextYear > Data.maxYear) {
        nextYear = Data.minYear;
      }
      State.setYear(nextYear);
    }, State.animationSpeed);
  },
  
  stop() {
    if (!State.isPlaying) return;
    
    State.setPlaying(false);
    clearInterval(this.interval);
    this.interval = null;
    this.updatePlayButton();
  },
  
  toggle() {
    if (State.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  },
  
  updatePlayButton() {
    const playIcon = document.getElementById("playIcon");
    const pauseIcon = document.getElementById("pauseIcon");
    
    if (playIcon && pauseIcon) {
      playIcon.style.display = State.isPlaying ? "none" : "block";
      pauseIcon.style.display = State.isPlaying ? "block" : "none";
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
    this.initSpeedSelect();
    this.initPlayButton();
    this.initLegend();
    this.initScrollytelling();
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
    
    // Populate dropdown
    const populateDropdown = (filter = "") => {
      dropdown.innerHTML = "";
      const filtered = Data.countries.filter(c => 
        c.toLowerCase().includes(filter.toLowerCase()) &&
        !State.selectedCountries.includes(c)
      );
      
      // Filter by active groups
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
        if (State.isPlaying) {
          Animation.stop();
        }
      });
    }
  },
  
  updateYearDisplay(year) {
    const slider = document.getElementById("yearSlider");
    const value = document.getElementById("yearValue");
    const playYear = document.getElementById("playYear");
    
    if (slider) slider.value = year;
    if (value) value.textContent = year;
    if (playYear) playYear.textContent = year;
  },
  
  initSpeedSelect() {
    const select = document.getElementById("speedSelect");
    if (select) {
      select.addEventListener("change", () => {
        State.setSpeed(parseInt(select.value));
        if (State.isPlaying) {
          Animation.stop();
          Animation.start();
        }
      });
    }
  },
  
  initPlayButton() {
    const btn = document.getElementById("playBtn");
    if (btn) {
      btn.addEventListener("click", () => Animation.toggle());
    }
  },
  
  initLegend() {
    const legendItems = document.querySelectorAll(".dashboard-legend .legend-item");
    
    legendItems.forEach(item => {
      item.addEventListener("click", () => {
        const groupId = parseInt(item.dataset.group);
        const toggle = document.querySelector(`.toggle-btn[data-group="${groupId}"]`);
        if (toggle) {
          toggle.click();
        }
      });
    });
  },
  
  updateLegend() {
    const legendItems = document.querySelectorAll(".legend-item[data-group]");
    legendItems.forEach(item => {
      const groupId = parseInt(item.dataset.group);
      item.classList.toggle("dimmed", !State.groups.includes(groupId));
    });
  },
  
  initScrollytelling() {
    const steps = document.querySelectorAll(".step");
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          const stepId = entry.target.dataset.step;
          if (stepId && State.currentStep !== stepId) {
            State.setStep(stepId);
            this.renderStoryStep(stepId);
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
  
  renderStoryStep(stepId) {
    const storyViz = document.getElementById("storyViz");
    const yearBg = document.getElementById("storyYearBg");
    if (!storyViz) return;
    
    const svg = d3.select("#storyViz")
      .attr("viewBox", "0 0 640 460")
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    svg.selectAll("*").remove();
    
    const W = 640, H = 460;
    const M = { top: 50, right: 40, bottom: 60, left: 70 };
    
    const xScale = d3.scaleLog()
      .domain([150, 100000])
      .range([M.left, W - M.right]);
    
    const yScale = d3.scaleLinear()
      .domain([0.2, 0.75])
      .range([H - M.bottom, M.top]);
    
    const xLinear = d3.scaleLinear()
      .domain([1980, 2024])
      .range([M.left, W - M.right]);
    
    // Helper to draw grid and axes
    const drawAxes = (xS, yS, xLabel, yLabel, isLog = true) => {
      // Grid
      yS.ticks(6).forEach(t => {
        svg.append("line")
          .attr("x1", M.left).attr("x2", W - M.right)
          .attr("y1", yS(t)).attr("y2", yS(t))
          .attr("class", "grid-line");
      });
      
      // X axis
      const xAxis = isLog
        ? d3.axisBottom(xS).tickValues([200, 500, 1000, 2000, 5000, 10000, 20000, 50000]).tickFormat(d => d >= 1000 ? `${d/1000}k` : d)
        : d3.axisBottom(xS).ticks(9).tickFormat(d3.format("d"));
      
      svg.append("g").attr("class", "axis")
        .attr("transform", `translate(0,${H - M.bottom})`)
        .call(xAxis);
      
      svg.append("g").attr("class", "axis")
        .attr("transform", `translate(${M.left},0)`)
        .call(d3.axisLeft(yS).ticks(6));
      
      svg.append("text").attr("class", "axis-label")
        .attr("x", W / 2).attr("y", H - 10)
        .attr("text-anchor", "middle").text(xLabel);
      
      svg.append("text").attr("class", "axis-label")
        .attr("x", -H / 2).attr("y", 18)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle").text(yLabel);
    };
    
    // Draw events on timeline
    const drawEvents = (xS) => {
      Data.events.forEach(ev => {
        svg.append("line")
          .attr("x1", xS(ev.year)).attr("x2", xS(ev.year))
          .attr("y1", M.top).attr("y2", H - M.bottom)
          .attr("class", "event-line");
        
        svg.append("text")
          .attr("x", xS(ev.year) + 4).attr("y", M.top + 12)
          .attr("class", "event-label").text(ev.label);
      });
    };
    
    // Watermark
    svg.append("text").attr("class", "year-watermark")
      .attr("x", W / 2).attr("y", H / 2 + 30)
      .attr("text-anchor", "middle");
    
    // Step-specific rendering
    switch(stepId) {
      case "intro":
        if (yearBg) yearBg.textContent = "1980";
        svg.select(".year-watermark").text("1980");
        drawAxes(xScale, yScale, "PIB par habitant ($, log)", "Indice de Gini");
        
        const data1980 = Data.raw.filter(d => d.year === 1980);
        svg.selectAll("circle").data(data1980).join("circle")
          .attr("class", "data-point")
          .attr("cx", d => xScale(Math.max(150, d.gdp)))
          .attr("cy", H - M.bottom)
          .attr("r", 0)
          .attr("fill", d => Data.groupColors[d.group])
          .attr("opacity", 0.8)
          .on("mouseenter", (e, d) => Tooltip.show(e, d))
          .on("mouseleave", () => Tooltip.hide())
          .transition().duration(800).delay((_, i) => i * 40)
          .attr("cy", d => yScale(d.gini))
          .attr("r", d => Data.getPopRadius(d.pop));
        
        svg.selectAll(".country-label").data(data1980).join("text")
          .attr("class", "country-label")
          .attr("x", d => xScale(Math.max(150, d.gdp)))
          .attr("y", d => yScale(d.gini) - Data.getPopRadius(d.pop) - 6)
          .text(d => Data.getShortName(d.country))
          .attr("opacity", 0)
          .transition().delay((_, i) => 600 + i * 40).duration(300)
          .attr("opacity", 1);
        break;
        
      case "fall-ussr":
        if (yearBg) yearBg.textContent = "1991";
        svg.select(".year-watermark").text("1991");
        drawAxes(xLinear, yScale, "Année", "Indice de Gini", false);
        drawEvents(xLinear);
        
        // Show Russia trajectory
        const russiaHistory = Data.getCountryHistory("Russian Federation");
        const line = d3.line()
          .x(d => xLinear(d.year))
          .y(d => yScale(d.gini))
          .curve(d3.curveCatmullRom);
        
        const path = svg.append("path")
          .datum(russiaHistory)
          .attr("d", line)
          .attr("fill", "none")
          .attr("stroke", Data.groupColors[2])
          .attr("stroke-width", 3);
        
        const pathLength = path.node().getTotalLength();
        path.attr("stroke-dasharray", pathLength)
          .attr("stroke-dashoffset", pathLength)
          .transition().duration(1500).ease(d3.easeCubic)
          .attr("stroke-dashoffset", 0);
        
        svg.append("text")
          .attr("x", xLinear(2024) + 8)
          .attr("y", yScale(russiaHistory[russiaHistory.length - 1].gini))
          .attr("class", "trajectory-label")
          .attr("fill", Data.groupColors[2])
          .text("Russie")
          .attr("opacity", 0)
          .transition().delay(1500).duration(300).attr("opacity", 1);
        break;
        
      case "china-wto":
        if (yearBg) yearBg.textContent = "2001";
        svg.select(".year-watermark").text("2001");
        drawAxes(xLinear, yScale, "Année", "Indice de Gini", false);
        drawEvents(xLinear);
        
        const chinaHistory = Data.getCountryHistory("China");
        const chinaLine = d3.line()
          .x(d => xLinear(d.year))
          .y(d => yScale(d.gini))
          .curve(d3.curveCatmullRom);
        
        const chinaPath = svg.append("path")
          .datum(chinaHistory)
          .attr("d", chinaLine)
          .attr("fill", "none")
          .attr("stroke", Data.groupColors[2])
          .attr("stroke-width", 3);
        
        const chinaLen = chinaPath.node().getTotalLength();
        chinaPath.attr("stroke-dasharray", chinaLen)
          .attr("stroke-dashoffset", chinaLen)
          .transition().duration(1500).ease(d3.easeCubic)
          .attr("stroke-dashoffset", 0);
        
        svg.append("text")
          .attr("x", xLinear(2024) + 8)
          .attr("y", yScale(chinaHistory[chinaHistory.length - 1].gini))
          .attr("class", "trajectory-label")
          .attr("fill", Data.groupColors[2])
          .text("Chine")
          .attr("opacity", 0)
          .transition().delay(1500).duration(300).attr("opacity", 1);
        break;
        
      case "crisis-2008":
        if (yearBg) yearBg.textContent = "2008";
        svg.select(".year-watermark").text("2008");
        drawAxes(xLinear, yScale, "Année", "Indice de Gini", false);
        drawEvents(xLinear);
        
        // G7 countries trajectories
        const g7Countries = ["USA", "Japan", "Germany", "France", "United Kingdom"];
        g7Countries.forEach((country, i) => {
          const history = Data.getCountryHistory(country);
          if (history.length === 0) return;
          
          const g7Line = d3.line()
            .x(d => xLinear(d.year))
            .y(d => yScale(d.gini))
            .curve(d3.curveCatmullRom);
          
          const g7Path = svg.append("path")
            .datum(history)
            .attr("d", g7Line)
            .attr("fill", "none")
            .attr("stroke", Data.groupColors[1])
            .attr("stroke-width", 2)
            .attr("opacity", 0.7);
          
          const g7Len = g7Path.node().getTotalLength();
          g7Path.attr("stroke-dasharray", g7Len)
            .attr("stroke-dashoffset", g7Len)
            .transition().duration(1200).delay(i * 100).ease(d3.easeCubic)
            .attr("stroke-dashoffset", 0);
          
          svg.append("text")
            .attr("x", xLinear(2024) + 8)
            .attr("y", yScale(history[history.length - 1].gini))
            .attr("class", "trajectory-label")
            .attr("fill", Data.groupColors[1])
            .attr("font-size", "9px")
            .text(Data.getShortName(country))
            .attr("opacity", 0)
            .transition().delay(1200 + i * 100).duration(300).attr("opacity", 1);
        });
        break;
        
      case "covid":
        if (yearBg) yearBg.textContent = "2020";
        svg.select(".year-watermark").text("2020");
        drawAxes(xScale, yScale, "PIB par habitant ($, log)", "Indice de Gini");
        
        const data2020 = Data.raw.filter(d => d.year === 2024); // Using 2024 as proxy
        svg.selectAll("circle").data(data2020).join("circle")
          .attr("class", "data-point")
          .attr("cx", d => xScale(Math.max(150, d.gdp)))
          .attr("cy", d => yScale(d.gini))
          .attr("r", 0)
          .attr("fill", d => Data.groupColors[d.group])
          .attr("opacity", 0.8)
          .on("mouseenter", (e, d) => Tooltip.show(e, d))
          .on("mouseleave", () => Tooltip.hide())
          .transition().duration(600).delay((_, i) => i * 30)
          .attr("r", d => Data.getPopRadius(d.pop));
        
        // Highlight South Africa
        const sa = data2020.find(d => d.country === "South Africa");
        if (sa) {
          setTimeout(() => {
            svg.append("line")
              .attr("x1", xScale(sa.gdp)).attr("y1", yScale(sa.gini) - Data.getPopRadius(sa.pop) - 10)
              .attr("x2", xScale(sa.gdp) + 40).attr("y2", yScale(sa.gini) - 50)
              .attr("stroke", Data.groupColors[2])
              .attr("stroke-dasharray", "3,3")
              .attr("opacity", 0)
              .transition().duration(400).attr("opacity", 0.8);
            
            svg.append("text")
              .attr("x", xScale(sa.gdp) + 45)
              .attr("y", yScale(sa.gini) - 55)
              .attr("fill", Data.groupColors[2])
              .attr("font-size", "10px")
              .attr("font-weight", "600")
              .text("Gini: 0.72")
              .attr("opacity", 0)
              .transition().delay(200).duration(400).attr("opacity", 1);
          }, 800);
        }
        break;
        
      case "today":
      case "conclusion":
        if (yearBg) yearBg.textContent = "2024";
        svg.select(".year-watermark").text("2024");
        drawAxes(xScale, yScale, "PIB par habitant ($, log)", "Indice de Gini");
        
        const data2024 = Data.raw.filter(d => d.year === 2024);
        svg.selectAll("circle").data(data2024).join("circle")
          .attr("class", "data-point")
          .attr("cx", d => xScale(Math.max(150, d.gdp)))
          .attr("cy", d => yScale(d.gini))
          .attr("r", 0)
          .attr("fill", d => Data.groupColors[d.group])
          .attr("opacity", 0.8)
          .on("mouseenter", (e, d) => Tooltip.show(e, d))
          .on("mouseleave", () => Tooltip.hide())
          .transition().duration(600).delay((_, i) => i * 30)
          .attr("r", d => Data.getPopRadius(d.pop));
        
        svg.selectAll(".country-label").data(data2024).join("text")
          .attr("class", "country-label")
          .attr("x", d => xScale(Math.max(150, d.gdp)))
          .attr("y", d => yScale(d.gini) - Data.getPopRadius(d.pop) - 6)
          .text(d => Data.getShortName(d.country))
          .attr("opacity", 0)
          .transition().delay((_, i) => 400 + i * 30).duration(300)
          .attr("opacity", 1);
        break;
    }
  },
  
  updateInsights() {
    const stats = Data.getStats(State);
    if (!stats) return;
    
    const highGDP = document.getElementById("insightHighGDP");
    const highGini = document.getElementById("insightHighGini");
    const lowGini = document.getElementById("insightLowGini");
    const avgGini = document.getElementById("insightAvgGini");
    const g7Gini = document.getElementById("g7Gini");
    const bricsGini = document.getElementById("bricsGini");
    const autresGini = document.getElementById("autresGini");
    
    if (highGDP) highGDP.textContent = `${Data.getShortName(stats.highestGDP.country)} (${Utils.formatCurrency(stats.highestGDP.gdp)})`;
    if (highGini) highGini.textContent = `${Data.getShortName(stats.highestGini.country)} (${stats.highestGini.gini.toFixed(3)})`;
    if (lowGini) lowGini.textContent = `${Data.getShortName(stats.lowestGini.country)} (${stats.lowestGini.gini.toFixed(3)})`;
    if (avgGini) avgGini.textContent = stats.avgGini.toFixed(3);
    
    if (g7Gini) g7Gini.textContent = stats.groupStats[1] ? stats.groupStats[1].avgGini.toFixed(3) : "—";
    if (bricsGini) bricsGini.textContent = stats.groupStats[2] ? stats.groupStats[2].avgGini.toFixed(3) : "—";
    if (autresGini) autresGini.textContent = stats.groupStats[3] ? stats.groupStats[3].avgGini.toFixed(3) : "—";
  }
};

// ═══ DASHBOARD CONTROLLER ═══
const Dashboard = {
  charts: {},
  
  init() {
    // Initialize all charts
    ScatterChart.init("#scatterViz");
    MapChart.init("#mapViz");
    TrajectoryChart.init("#trajectoryViz");
    RankingChart.init("#rankingViz");
    
    this.charts = {
      scatter: ScatterChart,
      map: MapChart,
      trajectory: TrajectoryChart,
      ranking: RankingChart
    };
    
    // Initial render
    this.renderAll();
  },
  
  renderAll(duration = 0) {
    const data = Data.filter(State);
    
    // Scatter
    ScatterChart.drawAxes();
    ScatterChart.render(data, duration);
    
    // Map
    MapChart.render(data, duration);
    
    // Trajectory - show all countries or selected
    const trajectoryCountries = State.selectedCountries.length > 0 
      ? State.selectedCountries 
      : Data.countries.slice(0, 8);
    TrajectoryChart.drawAxes();
    TrajectoryChart.render(trajectoryCountries.filter(c => 
      Data.raw.some(d => d.country === c && State.groups.includes(d.group))
    ), 1200);
    
    // Ranking
    RankingChart.drawAxes();
    RankingChart.render(data, duration);
    
    // Update insights
    UI.updateInsights();
  },
  
  highlightCountry(country) {
    ScatterChart.highlight(country);
    MapChart.highlight(country);
    TrajectoryChart.highlight(country);
    RankingChart.highlight(country);
  }
};

// ═══ HERO ANIMATION ═══
const HeroAnimation = {
  year: 1980,
  interval: null,
  
  start() {
    const heroYear = document.getElementById("heroYear");
    if (!heroYear) return;
    
    this.interval = setInterval(() => {
      this.year++;
      if (this.year > 2024) this.year = 1980;
      heroYear.textContent = this.year;
    }, 100);
  },
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
};

// ═══ STATE SUBSCRIBERS ═══
State.subscribe((key, value, state) => {
  switch(key) {
    case "year":
      UI.updateYearDisplay(value);
      Dashboard.renderAll(State.animationSpeed);
      break;
      
    case "groups":
      UI.updateLegend();
      Dashboard.renderAll(300);
      break;
      
    case "selectedCountries":
      UI.updateSelectedCountries();
      Dashboard.renderAll(300);
      break;
      
    case "highlightedCountry":
      Dashboard.highlightCountry(value);
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
  
  // Initialize UI
  UI.init();
  
  // Initialize dashboard
  Dashboard.init();
  
  // Start hero animation
  HeroAnimation.start();
  
  // Initial UI state
  UI.updateYearDisplay(State.year);
  UI.updateSelectedCountries();
  UI.updateLegend();
  UI.updateInsights();
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

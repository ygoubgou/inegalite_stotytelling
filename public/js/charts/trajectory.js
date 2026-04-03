// ═══════════════════════════════════════════════════════════════════════════
// TRAJECTORY CHART — Country Evolution Lines
// Authors: GOUBGOU & MOHAMMED
// ═══════════════════════════════════════════════════════════════════════════

const TrajectoryChart = {
  svg: null,
  width: 640,
  height: 460,
  margin: { top: 50, right: 60, bottom: 60, left: 70 },
  xScale: null,
  yScale: null,
  linesGroup: null,
  dotsGroup: null,
  
  // Initialize chart
  init(selector) {
    this.svg = d3.select(selector);
    if (this.svg.empty()) return;
    
    this.svg
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Create groups
    this.svg.append("g").attr("class", "grid-lines");
    this.svg.append("g").attr("class", "x-axis");
    this.svg.append("g").attr("class", "y-axis");
    this.svg.append("g").attr("class", "events-group");
    this.linesGroup = this.svg.append("g").attr("class", "lines-group");
    this.dotsGroup = this.svg.append("g").attr("class", "dots-group");
    this.svg.append("text").attr("class", "x-label");
    this.svg.append("text").attr("class", "y-label");
    this.svg.append("text").attr("class", "year-watermark");
    
    // Initialize scales
    this.xScale = d3.scaleLinear()
      .domain([1980, 2024])
      .range([this.margin.left, this.width - this.margin.right]);
    
    this.yScale = d3.scaleLinear()
      .domain([0.2, 0.75])
      .range([this.height - this.margin.bottom, this.margin.top]);
  },
  
  // Draw axes
  drawAxes() {
    const { margin, width, height, xScale, yScale, svg } = this;
    
    // Grid lines
    svg.select(".grid-lines").selectAll("line").remove();
    yScale.ticks(6).forEach(tick => {
      svg.select(".grid-lines").append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScale(tick))
        .attr("y2", yScale(tick))
        .attr("class", "grid-line");
    });
    
    // X axis
    svg.select(".x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(9));
    
    // Y axis
    svg.select(".y-axis")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(6));
    
    // Axis labels
    svg.select(".x-label")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Année");
    
    svg.select(".y-label")
      .attr("x", -height / 2)
      .attr("y", 18)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Indice de Gini");
    
    // Historical events
    this.drawEvents();
    
    // Watermark
    svg.select(".year-watermark")
      .attr("x", width / 2)
      .attr("y", height / 2 + 30)
      .text("1980–2024");
  },
  
  // Draw event markers
  drawEvents() {
    const { svg, xScale, margin, height } = this;
    const eventsGroup = svg.select(".events-group");
    eventsGroup.selectAll("*").remove();
    
    Data.events.forEach(event => {
      eventsGroup.append("line")
        .attr("x1", xScale(event.year))
        .attr("x2", xScale(event.year))
        .attr("y1", margin.top)
        .attr("y2", height - margin.bottom)
        .attr("class", "event-line");
      
      eventsGroup.append("text")
        .attr("x", xScale(event.year) + 4)
        .attr("y", margin.top + 12)
        .attr("class", "event-label")
        .text(event.label);
    });
  },
  
  // Render trajectories
  render(countries, duration = 1200) {
    const { linesGroup, dotsGroup, xScale, yScale, width, margin } = this;
    
    // Clear previous
    linesGroup.selectAll("*").remove();
    dotsGroup.selectAll("*").remove();
    
    // Get country data
    const countriesData = countries.map(country => {
      const history = Data.getCountryHistory(country);
      return { country, history, group: history[0]?.group || 3 };
    }).filter(d => d.history.length > 0);
    
    // Line generator
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.gini))
      .curve(d3.curveCatmullRom);
    
    // Draw each trajectory
    countriesData.forEach((countryData, i) => {
      const { country, history, group } = countryData;
      const color = Data.groupColors[group];
      
      // Line path
      const path = linesGroup.append("path")
        .datum(history)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2.5)
        .attr("opacity", 0.85)
        .attr("class", "trajectory-line")
        .attr("data-country", country);
      
      // Animate line drawing
      const pathLength = path.node().getTotalLength();
      path
        .attr("stroke-dasharray", pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(duration)
        .delay(i * 150)
        .ease(d3.easeCubic)
        .attr("stroke-dashoffset", 0);
      
      // Dots at key years
      const keyYears = [1980, 1991, 2000, 2008, 2020, 2024];
      const keyData = history.filter(d => keyYears.includes(d.year));
      
      dotsGroup.selectAll(`.dot-${country.replace(/\s/g, '')}`)
        .data(keyData)
        .enter()
        .append("circle")
        .attr("class", `trajectory-dot dot-${country.replace(/\s/g, '')}`)
        .attr("data-country", country)
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.gini))
        .attr("r", 0)
        .attr("fill", color)
        .attr("stroke", "rgba(255,255,255,0.5)")
        .attr("stroke-width", 1)
        .on("mouseenter", function(e, d) {
          Tooltip.show(e, d);
          State.setHighlightedCountry(country);
        })
        .on("mouseleave", function() {
          Tooltip.hide();
          State.setHighlightedCountry(null);
        })
        .transition()
        .duration(300)
        .delay(i * 150 + duration * (keyYears.indexOf(keyData[0]?.year) / keyYears.length))
        .attr("r", 5);
      
      // End label
      const lastPoint = history[history.length - 1];
      linesGroup.append("text")
        .attr("x", xScale(lastPoint.year) + 8)
        .attr("y", yScale(lastPoint.gini) + 4)
        .attr("class", "trajectory-label")
        .attr("fill", color)
        .attr("data-country", country)
        .text(Data.getShortName(country))
        .attr("opacity", 0)
        .transition()
        .delay(i * 150 + duration)
        .duration(300)
        .attr("opacity", 1);
    });
  },
  
  // Highlight specific country
  highlight(country) {
    this.linesGroup.selectAll("path")
      .classed("highlighted", function() {
        return d3.select(this).attr("data-country") === country;
      })
      .classed("dimmed", function() {
        return country && d3.select(this).attr("data-country") !== country;
      });
    
    this.dotsGroup.selectAll("circle")
      .classed("highlighted", function() {
        return d3.select(this).attr("data-country") === country;
      })
      .classed("dimmed", function() {
        return country && d3.select(this).attr("data-country") !== country;
      });
  },
  
  // Clear chart
  clear() {
    if (this.linesGroup) this.linesGroup.selectAll("*").remove();
    if (this.dotsGroup) this.dotsGroup.selectAll("*").remove();
    if (this.svg) this.svg.select(".events-group").selectAll("*").remove();
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrajectoryChart;
}

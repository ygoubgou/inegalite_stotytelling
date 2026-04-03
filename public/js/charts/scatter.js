// ═══════════════════════════════════════════════════════════════════════════
// SCATTER CHART — Gapminder-style Animated Scatter Plot
// Authors: GOUBGOU & MOHAMMED
// ═══════════════════════════════════════════════════════════════════════════

const ScatterChart = {
  svg: null,
  width: 640,
  height: 460,
  margin: { top: 50, right: 40, bottom: 60, left: 70 },
  xScale: null,
  yScale: null,
  bubblesGroup: null,
  labelsGroup: null,
  
  // Initialize chart
  init(selector) {
    this.svg = d3.select(selector)
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Create groups
    this.svg.append("g").attr("class", "grid-lines");
    this.svg.append("g").attr("class", "x-axis");
    this.svg.append("g").attr("class", "y-axis");
    this.svg.append("g").attr("class", "events-group");
    this.bubblesGroup = this.svg.append("g").attr("class", "bubbles-group");
    this.labelsGroup = this.svg.append("g").attr("class", "labels-group");
    this.svg.append("text").attr("class", "x-label");
    this.svg.append("text").attr("class", "y-label");
    this.svg.append("text").attr("class", "year-watermark");
    
    // Initialize scales
    this.xScale = d3.scaleLog()
      .domain([150, 100000])
      .range([this.margin.left, this.width - this.margin.right]);
    
    this.yScale = d3.scaleLinear()
      .domain([0.2, 0.75])
      .range([this.height - this.margin.bottom, this.margin.top]);
  },
  
  // Draw axes
  drawAxes(showEvents = false) {
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
    const xAxis = d3.axisBottom(xScale)
      .tickValues([200, 500, 1000, 2000, 5000, 10000, 20000, 50000])
      .tickFormat(d => d >= 1000 ? `${d/1000}k` : d);
    
    svg.select(".x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);
    
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
      .text("PIB par habitant ($, échelle log)");
    
    svg.select(".y-label")
      .attr("x", -height / 2)
      .attr("y", 18)
      .attr("transform", "rotate(-90)")
      .attr("text-anchor", "middle")
      .attr("class", "axis-label")
      .text("Indice de Gini");
    
    // Historical events
    if (showEvents) {
      this.drawEvents();
    }
  },
  
  // Draw historical event markers
  drawEvents() {
    const { svg, xScale, yScale, margin, height } = this;
    const eventsGroup = svg.select(".events-group");
    eventsGroup.selectAll("*").remove();
    
    // Events are shown as vertical zones
    Data.events.forEach(event => {
      const xPos = xScale(event.year);
      if (xPos >= margin.left && xPos <= this.width - margin.right) {
        eventsGroup.append("line")
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", margin.top)
          .attr("y2", height - margin.bottom)
          .attr("class", "event-line");
        
        eventsGroup.append("text")
          .attr("x", xPos + 4)
          .attr("y", margin.top + 12)
          .attr("class", "event-label")
          .text(event.label);
      }
    });
  },
  
  // Update year watermark
  updateWatermark(year) {
    this.svg.select(".year-watermark")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2 + 30)
      .attr("text-anchor", "middle")
      .attr("class", "year-watermark")
      .text(year);
  },
  
  // Render bubbles
  render(data, duration = 0) {
    const { bubblesGroup, labelsGroup, xScale, yScale } = this;
    
    // Update watermark
    if (data.length > 0) {
      this.updateWatermark(data[0].year);
    }
    
    // Bubbles
    const bubbles = bubblesGroup.selectAll("circle")
      .data(data, d => d.country);
    
    // Enter
    bubbles.enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", d => xScale(Math.max(150, d.gdp)))
      .attr("cy", d => yScale(d.gini))
      .attr("r", 0)
      .attr("fill", d => Data.groupColors[d.group])
      .attr("opacity", 0.8)
      .attr("stroke", "rgba(255,255,255,0.3)")
      .attr("stroke-width", 1)
      .on("mouseenter", function(e, d) {
        Tooltip.show(e, d);
        State.setHighlightedCountry(d.country);
        d3.select(this).raise();
      })
      .on("mouseleave", function() {
        Tooltip.hide();
        State.setHighlightedCountry(null);
      })
      .on("click", function(e, d) {
        e.stopPropagation();
        if (State.selectedCountries.includes(d.country)) {
          State.removeCountry(d.country);
        } else {
          State.addCountry(d.country);
        }
      })
      .transition().duration(duration || 600)
      .attr("r", d => Data.getPopRadius(d.pop));
    
    // Update
    bubbles.transition().duration(duration).ease(d3.easeCubic)
      .attr("cx", d => xScale(Math.max(150, d.gdp)))
      .attr("cy", d => yScale(d.gini))
      .attr("r", d => Data.getPopRadius(d.pop))
      .attr("fill", d => Data.groupColors[d.group]);
    
    // Exit
    bubbles.exit()
      .transition().duration(duration / 2)
      .attr("r", 0)
      .remove();
    
    // Labels
    const labels = labelsGroup.selectAll("text")
      .data(data, d => d.country);
    
    labels.enter()
      .append("text")
      .attr("class", "country-label")
      .attr("x", d => xScale(Math.max(150, d.gdp)))
      .attr("y", d => yScale(d.gini) - Data.getPopRadius(d.pop) - 6)
      .text(d => Data.getShortName(d.country))
      .attr("opacity", 0)
      .transition().delay(duration / 2).duration(300)
      .attr("opacity", 1);
    
    labels.transition().duration(duration).ease(d3.easeCubic)
      .attr("x", d => xScale(Math.max(150, d.gdp)))
      .attr("y", d => yScale(d.gini) - Data.getPopRadius(d.pop) - 6);
    
    labels.exit().remove();
  },
  
  // Highlight specific country
  highlight(country) {
    this.bubblesGroup.selectAll("circle")
      .classed("highlighted", d => d.country === country)
      .classed("dimmed", d => country && d.country !== country);
    
    this.labelsGroup.selectAll("text")
      .classed("highlighted", d => d.country === country);
  },
  
  // Clear chart
  clear() {
    this.bubblesGroup.selectAll("*").remove();
    this.labelsGroup.selectAll("*").remove();
    this.svg.select(".events-group").selectAll("*").remove();
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScatterChart;
}

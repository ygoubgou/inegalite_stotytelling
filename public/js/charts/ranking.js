// ═══════════════════════════════════════════════════════════════════════════
// RANKING CHART — Animated Bar Race Chart
// Authors: GOUBGOU & MOHAMMED
// ═══════════════════════════════════════════════════════════════════════════

const RankingChart = {
  svg: null,
  width: 640,
  height: 400,
  margin: { top: 40, right: 100, bottom: 40, left: 120 },
  xScale: null,
  yScale: null,
  barsGroup: null,
  maxBars: 10,
  
  // Initialize chart
  init(selector) {
    this.svg = d3.select(selector);
    if (this.svg.empty()) return;
    
    this.svg
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Create groups
    this.svg.append("g").attr("class", "x-axis");
    this.barsGroup = this.svg.append("g").attr("class", "bars-group");
    this.svg.append("text").attr("class", "year-watermark ranking-watermark");
    this.svg.append("text").attr("class", "chart-title");
    
    // Initialize scales
    this.xScale = d3.scaleLinear()
      .domain([0, 0.75])
      .range([this.margin.left, this.width - this.margin.right]);
    
    this.yScale = d3.scaleBand()
      .range([this.margin.top, this.height - this.margin.bottom])
      .padding(0.2);
  },
  
  // Draw axes
  drawAxes() {
    const { svg, xScale, margin, height } = this;
    
    svg.select(".x-axis")
      .attr("transform", `translate(0, ${margin.top})`)
      .call(d3.axisTop(xScale).ticks(5).tickFormat(d => d.toFixed(2)))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr("y2", height - margin.top - margin.bottom)
        .attr("stroke", "rgba(255,255,255,0.05)"));
    
    svg.select(".chart-title")
      .attr("x", this.width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("class", "chart-title")
      .text("Top 10 — Indice de Gini");
  },
  
  // Update year watermark
  updateWatermark(year) {
    this.svg.select(".year-watermark")
      .attr("x", this.width - this.margin.right - 20)
      .attr("y", this.height - 30)
      .attr("text-anchor", "end")
      .text(year);
  },
  
  // Render bars
  render(data, duration = 500) {
    const { barsGroup, xScale, yScale, margin, width, maxBars } = this;
    
    // Sort and take top N
    const sortedData = [...data]
      .sort((a, b) => b.gini - a.gini)
      .slice(0, maxBars);
    
    // Update watermark
    if (sortedData.length > 0) {
      this.updateWatermark(sortedData[0].year);
    }
    
    // Update y scale domain
    yScale.domain(sortedData.map(d => d.country));
    
    // Bars
    const bars = barsGroup.selectAll(".ranking-bar")
      .data(sortedData, d => d.country);
    
    // Enter
    const barsEnter = bars.enter()
      .append("g")
      .attr("class", "ranking-bar")
      .attr("transform", d => `translate(0, ${yScale(d.country)})`);
    
    barsEnter.append("rect")
      .attr("x", margin.left)
      .attr("y", 0)
      .attr("height", yScale.bandwidth())
      .attr("width", 0)
      .attr("fill", d => Data.groupColors[d.group])
      .attr("rx", 4)
      .attr("opacity", 0.85);
    
    barsEnter.append("text")
      .attr("class", "bar-label-left")
      .attr("x", margin.left - 8)
      .attr("y", yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text(d => Data.getShortName(d.country));
    
    barsEnter.append("text")
      .attr("class", "bar-label-right")
      .attr("x", margin.left)
      .attr("y", yScale.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("dx", 8)
      .text(d => d.gini.toFixed(3));
    
    barsEnter.append("circle")
      .attr("class", "bar-dot")
      .attr("cx", margin.left - 20)
      .attr("cy", yScale.bandwidth() / 2)
      .attr("r", 4)
      .attr("fill", d => Data.groupColors[d.group]);
    
    // Update
    const barsUpdate = bars.merge(barsEnter);
    
    barsUpdate.transition().duration(duration).ease(d3.easeCubic)
      .attr("transform", d => `translate(0, ${yScale(d.country)})`);
    
    barsUpdate.select("rect")
      .on("mouseenter", function(e, d) {
        Tooltip.show(e, d);
        State.setHighlightedCountry(d.country);
      })
      .on("mouseleave", function() {
        Tooltip.hide();
        State.setHighlightedCountry(null);
      })
      .transition().duration(duration).ease(d3.easeCubic)
      .attr("width", d => xScale(d.gini) - margin.left)
      .attr("fill", d => Data.groupColors[d.group]);
    
    barsUpdate.select(".bar-label-right")
      .transition().duration(duration).ease(d3.easeCubic)
      .attr("x", d => xScale(d.gini))
      .text(d => d.gini.toFixed(3));
    
    // Exit
    bars.exit()
      .transition().duration(duration / 2)
      .attr("opacity", 0)
      .remove();
  },
  
  // Highlight specific country
  highlight(country) {
    this.barsGroup.selectAll(".ranking-bar")
      .classed("highlighted", d => d.country === country)
      .classed("dimmed", d => country && d.country !== country);
  },
  
  // Clear chart
  clear() {
    if (this.barsGroup) this.barsGroup.selectAll("*").remove();
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RankingChart;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAP CHART — World Map with Bubbles
// Authors: GOUBGOU & MOHAMMED
// ═══════════════════════════════════════════════════════════════════════════

const MapChart = {
  svg: null,
  width: 900,
  height: 500,
  projection: null,
  path: null,
  geoData: null,
  bubblesGroup: null,
  labelsGroup: null,
  giniColorScale: null,
  popScale: null,
  
  // Initialize chart
  init(selector) {
    this.svg = d3.select(selector)
      .attr("viewBox", `0 0 ${this.width} ${this.height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Projection
    this.projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([this.width / 2, this.height / 2]);
    
    this.path = d3.geoPath().projection(this.projection);
    
    // Color scale for Gini (green = low, red = high)
    this.giniColorScale = d3.scaleSequential()
      .domain([0.25, 0.72])
      .interpolator(d3.interpolateRgbBasis(["#22c55e", "#eab308", "#ef4444"]));
    
    // Population scale for bubble size
    this.popScale = d3.scaleSqrt()
      .domain([0, 1.5e9])
      .range([6, 50]);
    
    // Create groups
    this.svg.append("g").attr("class", "countries-group");
    this.bubblesGroup = this.svg.append("g").attr("class", "bubbles-group");
    this.labelsGroup = this.svg.append("g").attr("class", "labels-group");
    this.svg.append("g").attr("class", "legend-group");
    this.svg.append("text").attr("class", "year-watermark map-watermark");
    
    // Load world map
    this.loadGeoData();
  },
  
  // Load geographic data
  async loadGeoData() {
    try {
      const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      this.geoData = topojson.feature(world, world.objects.countries);
      this.drawCountries();
    } catch (error) {
      console.warn("Impossible de charger la carte:", error);
    }
  },
  
  // Draw country shapes
  drawCountries() {
    if (!this.geoData) return;
    
    this.svg.select(".countries-group")
      .selectAll("path")
      .data(this.geoData.features)
      .join("path")
      .attr("d", this.path)
      .attr("class", "country-shape");
  },
  
  // Update year watermark
  updateWatermark(year) {
    this.svg.select(".year-watermark")
      .attr("x", this.width / 2)
      .attr("y", this.height / 2 + 40)
      .text(year);
  },
  
  // Render bubbles
  render(data, duration = 0) {
    const { bubblesGroup, labelsGroup, projection, giniColorScale, popScale } = this;
    
    // Update watermark
    if (data.length > 0) {
      this.updateWatermark(data[0].year);
    }
    
    // Filter data to only countries with centroids
    const mappableData = data.filter(d => Data.centroids[d.country]);
    
    // Bubbles
    const bubbles = bubblesGroup.selectAll("circle")
      .data(mappableData, d => d.country);
    
    bubbles.enter()
      .append("circle")
      .attr("class", "map-bubble")
      .attr("cx", d => projection(Data.centroids[d.country])[0])
      .attr("cy", d => projection(Data.centroids[d.country])[1])
      .attr("r", 0)
      .attr("fill", d => giniColorScale(d.gini))
      .attr("stroke", d => Data.groupColors[d.group])
      .attr("stroke-width", 2)
      .attr("opacity", 0.85)
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
      .transition().duration(duration || 600).delay((_, i) => i * 30)
      .attr("r", d => popScale(d.pop));
    
    bubbles.transition().duration(duration).ease(d3.easeCubic)
      .attr("cx", d => projection(Data.centroids[d.country])[0])
      .attr("cy", d => projection(Data.centroids[d.country])[1])
      .attr("r", d => popScale(d.pop))
      .attr("fill", d => giniColorScale(d.gini));
    
    bubbles.exit()
      .transition().duration(duration / 2)
      .attr("r", 0)
      .remove();
    
    // Labels
    const labels = labelsGroup.selectAll("text")
      .data(mappableData, d => d.country);
    
    labels.enter()
      .append("text")
      .attr("class", "map-label")
      .attr("x", d => projection(Data.centroids[d.country])[0])
      .attr("y", d => projection(Data.centroids[d.country])[1] - popScale(d.pop) - 6)
      .text(d => Data.getShortName(d.country))
      .attr("opacity", 0)
      .transition().delay(duration).duration(300)
      .attr("opacity", 1);
    
    labels.transition().duration(duration).ease(d3.easeCubic)
      .attr("x", d => projection(Data.centroids[d.country])[0])
      .attr("y", d => projection(Data.centroids[d.country])[1] - popScale(d.pop) - 6);
    
    labels.exit().remove();
    
    // Draw legend
    this.drawLegend();
  },
  
  // Draw color legend
  drawLegend() {
    const legendGroup = this.svg.select(".legend-group");
    legendGroup.selectAll("*").remove();
    
    const legendWidth = 120;
    const legendHeight = 12;
    const legendX = this.width - 150;
    const legendY = this.height - 60;
    
    // Gradient
    const defs = this.svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "giniGradient");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#22c55e");
    gradient.append("stop").attr("offset", "50%").attr("stop-color", "#eab308");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#ef4444");
    
    legendGroup.append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .attr("fill", "url(#giniGradient)")
      .attr("rx", 2);
    
    legendGroup.append("text")
      .attr("x", legendX)
      .attr("y", legendY - 8)
      .attr("class", "legend-title")
      .text("Indice de Gini");
    
    legendGroup.append("text")
      .attr("x", legendX)
      .attr("y", legendY + legendHeight + 14)
      .attr("class", "legend-label")
      .text("0.25");
    
    legendGroup.append("text")
      .attr("x", legendX + legendWidth)
      .attr("y", legendY + legendHeight + 14)
      .attr("class", "legend-label")
      .attr("text-anchor", "end")
      .text("0.72");
  },
  
  // Highlight specific country
  highlight(country) {
    this.bubblesGroup.selectAll("circle")
      .classed("highlighted", d => d.country === country)
      .classed("dimmed", d => country && d.country !== country);
  },
  
  // Clear chart
  clear() {
    this.bubblesGroup.selectAll("*").remove();
    this.labelsGroup.selectAll("*").remove();
  },
  
  // Show/hide
  show() {
    document.getElementById("mapContainer").style.display = "flex";
  },
  
  hide() {
    document.getElementById("mapContainer").style.display = "none";
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapChart;
}

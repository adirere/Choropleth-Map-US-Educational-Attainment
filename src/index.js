import "./styles.css";
import * as d3 from "d3";
import * as topojson from "topojson";

const app = document.getElementById("app");
const USEducationDataURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const USCountyDataURL =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

loadDataAndCreateChoropleth();

async function loadDataAndCreateChoropleth() {
  const countyDataTopology = await d3.json(USCountyDataURL);
  const countyData = topojson.feature(
    countyDataTopology,
    countyDataTopology.objects.counties
  ).features;

  const educationData = await d3.json(USEducationDataURL);

  createChoropleth(countyData, educationData);
}

const createChoropleth = (countyData, educationData) => {
  app.innerHTML = "";

  const w = 1000;
  const h = 600;

  //set title
  d3.select("#app")
    .append("div")
    .attr("id", "title")
    .text("United States Educational Attainment");

  //set description
  d3.select("#app")
    .append("div")
    .attr("id", "description")
    .text(
      "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
    );

  //build tooltip
  const tooltip = d3.select("#app").append("div").attr("id", "tooltip");

  //build legend
  d3.select("body")
    .append("svg")
    .attr("id", "legend")
    .attr("height", 200)
    .attr("width", 200);

  for (let i = 0; i <= 4; i++) {
    d3.select("#legend")
      .append("g")
      .attr("id", "g1")
      .append("rect")
      .attr("x", 10)
      .attr("y", i * 40)
      .attr("width", 40)
      .attr("height", 40)
      .attr("fill", () => {
        if (i === 0) return "#F07167";
        if (i === 1) return "#FED9B7";
        if (i === 2) return "#FDFCDC";
        if (i === 3) return "#00AFB9";
        if (i === 4) return "#0081A7";
      });

    d3.select("#g1")
      .append("text")
      .attr("x", 60)
      .attr("y", 20 + i * 40)
      .attr("fill", "rgb(97, 96, 96)")
      .text(() => {
        if (i === 0) {
          return "Less than 13%";
        } else if (i === 4) {
          return "More than 52%";
        } else {
          return `${i * 13}% - ${(i + 1) * 13}%`;
        }
      });
  }

  //build svg
  const svg = d3
    .select("#app")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  //build map
  svg
    .selectAll("path")
    .data(countyData)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("class", "county")
    .attr("fill", (d) => {
      const countyDegree = Number(
        educationData.filter((e) => e.fips === d.id)[0].bachelorsOrHigher
      );
      if (countyDegree < 13) return "#F07167";
      if (countyDegree >= 13 && countyDegree < 26) return "#FED9B7";
      if (countyDegree >= 26 && countyDegree < 39) return "#FDFCDC";
      if (countyDegree >= 39 && countyDegree < 52) return "#00AFB9";
      if (countyDegree >= 52) return "#0081A7";
    })
    .attr("data-fips", (d) => d.id)
    .attr(
      "data-education",
      (d) => educationData.filter((e) => e.fips === d.id)[0].bachelorsOrHigher
    )
    .on("mouseover", (event, countyGeo) => {
      tooltip.transition().style("visibility", "visible");
      const county = educationData.filter((e) => e.fips === countyGeo.id)[0];
      tooltip.text(
        `${county.area_name}, ${county.state}: ${county.bachelorsOrHigher}%`
      );
      tooltip
        .style("left", event.clientX + "px")
        .style("top", event.clientY + "px")
        .attr("data-education", county.bachelorsOrHigher);
      console.log(countyGeo);
    })
    .on("mouseout", () => tooltip.transition().style("visibility", "hidden"));
};

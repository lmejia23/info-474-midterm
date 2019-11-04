'use strict';

let data = "no data";
let allGenData = "no data";
let svgScatterPlot = ""; // keep SVG reference in global scope
let legend = "";
let funcs = "";
let dropDown = "";
let dropDown1 = "";
let selectedGen = "";
let selectedLeg = "";
let coord = [];

const colors = {
  "Bug": "#4E79A7",
  "Dark": "#A0CBE8",
  "Dragon": "#F28E2B",
  "Electric": "#ffb66e",
  "Fairy": "#993d94",
  "Fighting": "#59A14F",
  "Fire": "#8CD17D",
  "Flying": "#e3a3df",
  "Ghost": "#947c23",
  "Grass": "#e6ce77",
  "Ground": "#499894",
  "Ice": "#86BCB6",
  "Normal": "#E15759",
  "Poison": "#FF9D9A",
  "Psychic": "#69605e",
  "Rock": "#BAB0AC",
  "Steel": "#b55c7c",
  "Water": "#edafc6"
}

const m = {
  width: 1100,
  height: 600,
  marginAll: 50
}

// load data and make scatter plot after window loads
svgScatterPlot = d3.select('body')
  .append('svg')
  .attr('width', m.width)
  .attr('height', m.height);

legend = d3.select("#legend")
  .append('svg')
  .attr('width', 300)
  .attr('height', 500);

// d3.csv is basically fetch but it can be be passed a csv file as a parameter
d3.csv("data/pokemon.csv")
  .then((csvData) => {
    data = csvData
    allGenData = csvData
    funcs = makeAxesAndLabels()
    selectedGen = "allGen";
    selectedLeg = "allLeg";
    makeScatterPlot(selectedGen, selectedLeg, funcs)
  }).then(() => {
    d3.selectAll("#generation, #legendary").on('change', function () {
      coord = [];
      legend.selectAll("rect").remove()
      legend.selectAll("text").remove()
      svgScatterPlot.selectAll("circle").remove()
      makeScatterPlot(selectedGen, selectedLeg, funcs)})
    });

function makeAxesAndLabels() {
  // get Sp. Def and Total arrays
  const defData = data.map((row) => parseFloat(row["Sp. Def"]))
  const totalData = data.map((row) => parseFloat(row["Total"]))

  // find limits of data
  const limits = findMinMax(defData, totalData);

  // draw axes and return scaling + mapping functions
  const funcs = drawAxes(limits, "Sp. Def", "Total", svgScatterPlot,
    {min: m.marginAll + 100, max: (m.width - m.marginAll) + 40}, {min: m.marginAll, max: m.height - m.marginAll});

  // draw title and axes labels
  makeLabels();

  dropDown = d3.select("#generation").append("select")
  var options = dropDown.selectAll("option")
    .data(d3.map(allGenData, function(d){return d.Generation;}).keys())
    .enter()
    .append("option")
    .text(function(d){return d;})
    .attr("value",function(d){return d;});
  var defaultOption = dropDown.append("option")
    .data(allGenData)
    .text("All")
    .attr("value", "allGen")
    .attr("selected", true)
    .enter();

  dropDown1 = d3.select("#legendary").append("select")
  var options1 = dropDown1.selectAll("option")
    .data(d3.map(allGenData, function(d){return d.Legendary;}).keys())
    .enter()
    .append("option")
    .text(function(d){return d;})
    .attr("value",function(d){return d;});
  var defaultOption1 = dropDown1.append("option")
    .data(allGenData)
    .text("All")
    .attr("value", "allLeg")
    .attr("selected", true)
    .enter();

  return funcs;
}


// make scatter plot with trend line
function makeScatterPlot(selectedGen, selectedLeg, funcs) {
  if (selectedGen == "allGen" || selectedLeg == "allLeg") {
    data = allGenData;
  }

  if (selectedGen != "allGen") {
    filterByGen(selectedGen);
  }

  if (selectedLeg != "allLeg") {
    filterByLeg(selectedLeg);
  }

  // plot data as points and add tooltip functionality
  plotData(funcs);
}

function filterByGen(selectedGen) {
  data = allGenData.filter((row) => row['Generation'] == selectedGen);
}

function filterByLeg(selectedLeg) {
  data = data.filter((row) => row['Legendary'] == selectedLeg);
}

// make title and axes labels
function makeLabels() {
  svgScatterPlot.append('text')
    .attr('x', 650)
    .attr('y', 595)
    .attr('id', "x-label")
    .style('font-size', '14pt')
    .text('Sp. Def');

  svgScatterPlot.append('text')
    .attr('transform', 'translate(100, 300)rotate(-90)')
    .style('font-size', '14pt')
    .text('Total');
}

// plot all the data points on the SVG
// and add tooltip functionality
function plotData(map) {
  // mapping functions
  let xMap = map.x;
  let yMap = map.y;

  // make tooltip
  let div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

  let legendData = d3.map(data, function(d){return d["Type 1"];}).keys()

  var size = 15
  legend.selectAll(".rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 10)
    .attr("y", function(d,i){ return 10 + i*(size+5)})
    .attr("width", size)
    .attr("height", size)
    .style("fill", (d) => colors[d])

  legend.selectAll(".rect")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 35)
    .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

  var circles = svgScatterPlot.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', xMap)
    .attr('cy', yMap)
    .attr('r', 9)
    .attr('fill', (d) => colors[d["Type 1"]])
    .attr('stroke', '#0066cc')
    .attr('stroke-width', '1')
    .attr('class', 'dataPoint')

  // All the coordinate point for the current data
  for (let i = 0; i < data.length; i++) {
    coord.push("(" + data[i]["Sp. Def"] + ", " + data[i]["Total"] + ")")
  }

  //Aan array of just duplicates that have the same Sp. Def and Total
  let b = [];
  let k = 0;
  for (let i = 0; i < coord.length; i++) {
    for (let j = 0; j < coord.length; j++) {
      if((coord[j] === coord[i]) && j != i) {
        b[k++] = coord[i];
      }
    }
  }

  circles
    .filter(function(d) {
      return !b.includes("(" + d["Sp. Def"] + ", " + d["Total"] + ")")
    })
    .on("mouseover", (d) => {
      div.transition()
      .duration(200)
      .style("width", 150 + "px")
      .style("height", 50 + "px")
      .style("opacity", .9)
      if (d["Type 2"] == "") {
        div.html("Name: " + d.Name + "<br/>" +
        "Type 1: " + d["Type 1"])
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
      } else {
        div.html("Name: " + d.Name + "<br/>" +
        "Type 1: " + d["Type 1"] + "<br/>" +
        "Type 2: " + d["Type 2"])
        .style("left", (d3.event.pageX + 15) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
      }
    })
    .on("mouseout", (d) => {
      div.transition()
      .duration(500)
      .style("opacity", 0);
    })

  let theType1 = [];
  let theRest = [];
  circles
    .filter(function(d) {
      if(b.includes("(" + d["Sp. Def"] + ", " + d["Total"] + ")")) {
        if(!theType1.includes(d["Type 1"]) && !theRest.includes(d["Type 1"])) {
          if (theType1.length <= 8) {
            theType1.push(d["Type 1"])
          } else {
            theRest.push(d["Type 1"])
          }
        }
      }
      return b.includes("(" + d["Sp. Def"] + ", " + d["Total"] + ")")
    })
    .on("mouseover", (d) => {
      div.transition()
      .duration(200)
      .style("width", 330 + "px")
      .style("height", 90 + "px")
      .style("opacity", .9)
      div.html("**Multiple Pokemons have this same Sp. Def & Total**" + "<br/>" + "Names : * " + "<br/>" + "Type 1 : " + "<br/>" + theType1 + "<br/>" + theRest + "<br/>" + "Type 2 : *")
      .style("left", (d3.event.pageX + 15) + "px")
      .style("top", (d3.event.pageY - 28) + "px")
    })
    .on("mouseout", (d) => {
      div.transition()
      .duration(500)
      .style("opacity", 0);
    })

  dropDown.on("change", function() {
    selectedGen = this.value;
    var displayOthers = this.checked ? "inline" : "none";
    var display = this.checked ? "none" : "inline";

    if (selectedGen === "allGen") {
      var displayOthers = "inline"
      var display = "inline"
    }

    circles
      .filter(function(d) {return selectedGen != d.Generation;})
      .attr("display", displayOthers)

    circles
      .filter(function(d) {return selectedGen == d.Generation;})
      .attr("display", display)
  });

  dropDown1.on("change", function() {
    selectedLeg = this.value;
    var displayOthers = this.checked ? "inline" : "none";
    var display = this.checked ? "none" : "inline";

    if (selectedLeg === "allLeg") {
      var displayOthers = "inline"
      var display = "inline"
    }

    circles
      .filter(function(d) {return selectedLeg != d.Legendary;})
      .attr("display", displayOthers)

    circles
      .filter(function(d) {return selectedLeg == d.Legendary;})
      .attr("display", display)
  });
}

// draw the axes and ticks
function drawAxes(limits, x, y, svg, rangeX, rangeY) {
  // return x value from a row of data
  let xValue = function(d) { return +d[x]; }

  // function to scale x value
  let xScale = d3.scaleLinear()
    .domain([limits.xMin, limits.xMax]) // give domain buffer room
    .range([rangeX.min, rangeX.max]);

  // xMap returns a scaled x value from a row of data
  let xMap = function(d) { return xScale(xValue(d)); };

  // plot x-axis at bottom of SVG
  let xAxis = d3.axisBottom().scale(xScale);
  svg.append("g")
    .attr('transform', 'translate(0, ' + rangeY.max + ')')
    .attr('id', "x-axis")
    .call(xAxis);

  // return y value from a row of data
  let yValue = function(d) { return +d[y]}

  // function to scale y
  let yScale = d3.scaleLinear()
    .domain([limits.yMax, limits.yMin]) // give domain buffer
    .range([rangeY.min, rangeY.max]);

  // yMap returns a scaled y value from a row of data
  let yMap = function (d) { return yScale(yValue(d)); };

  // plot y-axis at the left of SVG
  let yAxis = d3.axisLeft().scale(yScale);
  svg.append('g')
    .attr('transform', 'translate(' + rangeX.min + ', 0)')
    .attr('id', "y-axis")
    .call(yAxis);

  // return mapping and scaling functions
  return {
    x: xMap,
    y: yMap,
    xScale: xScale,
    yScale: yScale
  };
}

// find min and max for arrays of x and y
function findMinMax(x, y) {
  // get min/max x values
  let xMin = d3.min(x);
  let xMax = d3.max(x);

  // get min/max y values
  let yMin = d3.min(y);
  let yMax = d3.max(y);

  // return formatted min/max data as an object
  return {
    xMin : xMin - 10,
    xMax : xMax,
    yMin : yMin - 30,
    yMax : yMax
  }
}

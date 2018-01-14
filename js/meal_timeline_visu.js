
function display_meal_timeline(region) {
// basic SVG setup
  var margin = {top: 100, right: 100, bottom: 40, left: 250};
  var height = 500 - margin.top - margin.bottom;
  var width = 960 - margin.left - margin.right;

  var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// setup scales - the domain is specified inside of the function called when we load the data
  var xScale = d3.scaleLinear().range([0, width]);
  xScale
  var yScale = d3.scaleLinear().range([height, 0]);
  var color = d3.scaleLinear(d3.schemeCategory10);

// setup the axes
  var xAxis = d3.axisBottom(xScale);
  var yAxis = d3.axisLeft(yScale);


  var bisectDate = d3.bisector(function (d) {
    return d.date;
  }).left;
  var bisectMeasurement = d3.bisector(function (d) {
    return d;
  }).left;



// set the line attributes
  var line = d3.line()
    .x(function (d) {
      return xScale(d.date);
    })
    .y(function (d) {
      console.log("valeur :"+ d.value + " --> scaled : "+yScale(d.value));
      return yScale(d.value);
    });

  var focus = svg.append("g").style("display", "none");

// import data and create chart
  var basepath = "data/csv/duree_repas_mean/duree_repas_mean";gu
  var data = [];
  var counter = 0;
  [1,2,3,4,5,6,7].forEach(function (numjour) {
    var daily_data = {};
    daily_data['date']=+numjour;
    ['Petit-dejeuner','Dejeuner', 'Diner'].forEach(function(typerep){
      d3.text(basepath+"_of_tyrep_"+typerep+"_of_nojour_"+numjour+".csv",
        function (error, raw) {
          var dsv = d3.dsvFormat(';');
          var dta = dsv.parse(raw);
          var d = dta[region_num_to_postal_code_map[region]];
          if (d['mean']){
            daily_data[typerep] = +d['mean'];
          }
          counter=counter+1;
          if (counter == 21)
            continueExecution(data)
        }
      );
    });
    data.push(daily_data);
  });

  function continueExecution(data)
  {

    console.log(data);
    // sort data ascending - needed to get correct bisector results
    data.sort(function (a, b) {
      return a.date - b.date;
    });


    // create stocks array with object for each company containing all data
    var stocks = d3.keys(data[0]).filter(function (key) {
      return key !== "date";
    }).map(function(name) {
      return {
        name: name,
        values: data.map(function(d){
          return {date: d.date, value: d[name]};
        })
      };
    });

    // add domain ranges to the x and y scales
    xScale.domain([
      d3.min(stocks, function (c) {
        return d3.min(c.values, function (v) {
          return v.date;
        });
      }),
      d3.max(stocks, function (c) {
        return d3.max(c.values, function (v) {
          return v.date;
        });
      })
    ]);
    yScale.domain([
      0,
      // d3.min(stocks, function(c) { return d3.min(c.values, function(v) { return v.value; }); }),
      d3.max(stocks, function (c) {
        return d3.max(c.values, function (v) {
          return v.value;
        });
      })
    ]);

    // add the x axis
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis.ticks(7));

    // add the y axis
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Price ($)");

    // add circle at intersection
    focus.append("circle")
      .attr("class", "y")
      .attr("fill", "none")
      .attr("stroke", "black")
      .style("opacity", 0.5)
      .attr("r", 8);

    focus.append("text")
      .attr("class", "text")
      .attr("fill", "none")
      .attr("stroke", "black")
      .style("opacity", 0.8);


    // add horizontal line at intersection
    focus.append("line")
      .attr("class", "x")
      .attr("stroke", "black")
      .attr("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("x1", 0)
      .attr("x2", width);

    // add vertical line at intersection
    focus.append("line")
      .attr("class", "y")
      .attr("stroke", "black")
      .attr("stroke-dasharray", "3,3")
      .style("opacity", 0.5)
      .attr("y1", 0)
      .attr("y2", height);

    // append rectangle for capturing if mouse moves within area
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", function () {
        focus.style("display", null);
      })
      .on("mouseout", function () {
        focus.style("display", "none");
      })
      .on("mousemove", mousemove);

    // add the line groups
    var stock = svg.selectAll(".stockXYZ")
      .data(stocks)
      .enter().append("g")
      .attr("class", "stockXYZ");

    // add the stock price paths
    stock.append("path")
      .attr("class", "line")
      .attr("id", function (d, i) {
        return "id" + i;
      })
      .attr("d", function (d) {
        return line(d.values);
      });

    // add the stock labels at the right edge of chart
    var maxLen = data.length;
    stock.append("text")
      .datum(function (d) {
        return {name: d.name, value: d.values[maxLen - 1]};
      })
      .attr("transform", function (d) {
        return "translate(" + xScale(d.value.date) + "," + yScale(d.value.value) + ")";
      })
      .attr("id", function (d, i) {
        return "text_id" + i;
      })
      .attr("x", 3)
      .attr("dy", ".35em")
      .text(function (d) {
        return d.name;
      })
      .on("mouseover", function (d, i) {
        for (j = 0; j < 6; j++) {
          if (i !== j) {
            d3.select("#id" + j).style("opacity", 0.1);
            d3.select("#text_id" + j).style("opacity", 0.2);
          }
        }
      })
      .on("mouseout", function (d, i) {
        for (j = 0; j < 6; j++) {
          d3.select("#id" + j).style("opacity", 1);
          d3.select("#text_id" + j).style("opacity", 1);
        }
      });

    // mousemove function
    function mousemove() {

      var x0 = xScale.invert(d3.mouse(this)[0]);
      var i = bisectDate(data, x0, 1); // gives index of element which has date higher than x0
      var d0 = data[i - 1], d1 = data[i];
      var d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      var y0 = yScale.invert(d3.mouse(this)[1]);
      var tempdata=[+d['Petit-dejeuner'], +d['Dejeuner'], +d['Diner']].sort();
      var i = bisectMeasurement(tempdata, y0, 1); // gives index of element which has date higher than x0

      var d0 = tempdata[i - 1], d1 = tempdata[i];
      var value = y0 - d0 > d1 - y0 ? d1 : d0;


      // var value = d3.max([+d['Petit-dejeuner'], +d['Dejeuner'], +d['Diner']]);

      focus.select("circle.y")
        .attr("transform", "translate(" + xScale(d.date) + "," + yScale(value) + ")");

      focus.select("line.y")
        .attr("y2", height - yScale(value))
        .attr("transform", "translate(" + xScale(d.date) + ","
          + yScale(value) + ")");

      focus.select("line.x")
        .attr("x2", xScale(d.date))
        .attr("transform", "translate(0,"
          + (yScale(value)) + ")");

      focus.select("text.text")
        .attr("transform", "translate("+xScale(d.date+0.05)+ ","
          + (yScale(value)) + ")")
        .text(value);

    }
  }

  return svg;
}
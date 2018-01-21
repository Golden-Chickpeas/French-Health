/**
*
* @file Contains the necessary functions for visualising meal compositions of regions
* @author Valentina Zelaya & Timothy Garwood
* @version 1.0
*/

function load_meal_composition(data_file_path){

  // Load the visualisation's information
  d3.select('#sunburst_info')
  .attr("title","Cette visualisation montre la composition d'un plat moyen sur la semaine pour le repas sélectionné."+ "\n" +
  "Cliquez sur un des demi-cercles pour zoomer.");

  //Remove all previous circle_pack visualisations
    d3.select('#sunburst_visu').remove();
      d3.select('#sunburst_trail').remove();

    // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
      var b = {w: 150, h: 30, s: 3, t: 10};
      var totalSize=0;

    var svg = d3.select("#sunburst_container").append("svg")
            .attr("id", "sunburst_visu")
            .attr("width", width/3)
            .attr("height", height/1.4)
          .append("g")
            .attr("transform", "translate(" + width / 6 + "," + (height / 2.8) + ")");

    var radius = (Math.min(width/3, height/1.4) / 2) - 10;
    var formatNumber = d3.format(",d");

    var x = d3.scaleLinear()
        .range([0, 2 * Math.PI]);

    var y = d3.scaleSqrt()
        .range([0, radius]);

    var color = d3.scaleOrdinal(d3.schemeCategory20b);

    var partition = d3.partition();

    var arc = d3.arc()
        .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
        .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
        .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
        .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

    d3.json(data_file_path, function(error, root) {
      if (error) throw error;

      root = d3.hierarchy(root);
      root.sum(function(d) { return d.size; });

      //get total size from rect
    totalSize = root.value;

      path = svg.selectAll("path")
          .data(partition(root).descendants())
        .enter().append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
          .attr("stroke", "rgb(100,100,100)")
          .on("click", click)
        .append("title")
          .text(function(d) { return d.data.name + "\n" + (d.children ? formatNumber(d.value/totalSize * 100) : (d.value/totalSize * 100).toFixed(2)) + "%"; });

        //add breadcrumb
        initializeBreadcrumbTrail();
        var percentage = 100;
      	var percentageString = percentage + "%";

      	  d3.select("#percentage")
      		  .text(percentageString);

      	  d3.select("#explanation")
      		  .style("visibility", "");

      	var sequenceArray = root.ancestors().reverse();
      	updateBreadcrumbs(sequenceArray, percentageString);



    });

    function click(d) {
      svg.transition()
          .duration(750)
          .tween("scale", function() {
            var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(y.domain(), [d.y0, 1]),
                yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
            return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
          })
        .selectAll("path")
          .attrTween("d", function(d) { return function() { return arc(d); }; });

          // Update the trail;
      	  var percentage = (100 * d.value / totalSize).toPrecision(3);
      	  var percentageString = percentage + "%";
      	  if (percentage < 0.1) {
      		    percentageString = "< 0.1%";
      	  }

      	  d3.select("#percentage")
      		  .text(percentageString);

      	  d3.select("#explanation")
      		  .style("visibility", "");

      	  var sequenceArray = d.ancestors().reverse();
      	  //sequenceArray.shift(); // remove root node from the array
      	  updateBreadcrumbs(sequenceArray, percentageString);
    }


    function initializeBreadcrumbTrail() {
      // Add the svg area.
      var trail = d3.select("#breadcrumb_sunburst").append("svg")
          .attr("width", width/3)
          .attr("height", 30)
          .attr("id", "sunburst_trail");
      // Add the label at the end, for the percentage.
      trail.append("text")
        .attr("id", "endlabel")
        .style("fill", "#000");

        // Make the breadcrumb trail visible, if it's hidden.
      d3.select("#sunburst_trail")
          .style("visibility", "");
    }

    // Generate a string that describes the points of a breadcrumb polygon.
    function breadcrumbPoints(d, i) {
      var points = [];
      points.push("0,0");
      points.push(b.w + ",0");
      points.push(b.w + b.t + "," + (b.h / 2));
      points.push(b.w + "," + b.h);
      points.push("0," + b.h);
      if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
        points.push(b.t + "," + (b.h / 2));
      }
      return points.join(" ");
    }

    // Update the breadcrumb trail to show the current sequence and percentage.
    function updateBreadcrumbs(nodeArray, percentageString) {
      // console.log(nodeArray);

      // Data join; key function combines name and depth (= position in sequence).
      var trail = d3.select("#sunburst_trail")
          .selectAll("g")
          .data(nodeArray, function(d) { return d.data.name; });

      // Remove exiting nodes.
      trail.exit().remove();

      // Add breadcrumb and label for entering nodes.
      var entering = trail.enter().append("g");

      // console.log(entering);
      entering.append("polygon")
          .attr("id", "bd_sb_label")
          .attr("points", breadcrumbPoints)
          .style("fill", function(d) { return color((d.children ? d : d.parent).data.key); });

      entering.append("text")
          .attr("x", (b.w + b.t) / 2)
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(function(d) { return d.data.name.length<15 ? d.data.name + d.depth : d.data.name.substring(0,16); });

      entering.append("title")
          .attr("x", (b.w + b.t) / 2)
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(function(d) { return d.data.name; });

      // Merge enter and update selections; set position for all nodes.
      entering.merge(trail).attr("transform", function(d, i) {
        return "translate(" + i * (b.w + b.s) + ", 0)";
      });

      // Now move and update the percentage at the end.
      d3.select("#trail").select("#endlabel")
          .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(percentageString);
    }

}

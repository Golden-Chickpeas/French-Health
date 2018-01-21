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
    d3.select('#sunburst_svg').remove();

    var svg = d3.select("#sunburst_container").append("svg")
            .attr("id", "sunburst_svg")
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
      svg.selectAll("path")
          .data(partition(root).descendants())
        .enter().append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color((d.children ? d : d.parent).data.name); })
          .on("click", click)
        .append("title")
          .text(function(d) { return d.data.name + "\n" + formatNumber(d.value); });
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
    }

}

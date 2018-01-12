/**
* region_mapper.js contains all necessary functions for the
* update of the selected region's visualised data, which are usually means of some kind
*
* @file Contains the necessary functions for visualising regions food facts
* @author Valentina Zelaya & Timothy Garwood
* @version 1.0
*/


function goto_region(d){
  console.log(region_num_to_postal_code_map);

  var x, y, k;

  if (d && centered !== d) {
    var centroid = geopath.centroid(d);
    x= centroid[0]+80;
    y=centroid[1]+80;
    // x = d3.event.pageX-150;
    // y = d3.event.pageY;
    k = 3;
    centered = d;
  } else {
    x = width / 3.2;
    y = height / 1.4;
    k = 1;
    centered = null;
  }

  fr_regions.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  fr_regions.transition()
      .duration(800)
      .attr("transform", "translate(" + width / 3.2 + "," + height / 1.4 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .attr("d", geopath)
      .style("stroke-width", 1.5 / k + "px")
      .style("fill", "#99ff99");

  display_meal_timeline(1);
}

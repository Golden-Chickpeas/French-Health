/**
* region_mapper.js contains all necessary functions for the
* update of the selected region's visualised data, which are usually means of some kind
*
* @file Contains the necessary functions for visualising regions food facts
* @author Valentina Zelaya & Timothy Garwood
* @version 1.0
*/


function goto_region(d,reg_num){
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
    region_foodgrp_data='data/json/foodgrp_sougrp_conso_week/region'+reg_num+'/consos_grp_'+window.selected_foodgrp+'_region_'+reg_num+'.json'
     load_circle_packing(region_foodgrp_data)
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
}



function load_circle_packing(data_file_path){

  //Remove all previous circle_pack visualisations
    d3.select('#circle_pack').remove();

    var svg = d3.select("#week_circle_pack").append("svg")
    .attr("id", "circle_pack") .attr("width",width/3) .attr("height",height/1.4),

    margin = 10,
    diameter = +svg.attr("width"),
    g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var color = d3.scaleLinear()
                  .domain([-1, 5])
                  .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
                  .interpolate(d3.interpolateHcl);

    var pack = d3.pack()
                  .size([diameter - margin, diameter - margin])
                  .padding(2);

      d3.json(data_file_path, function(error, root) {
        if (error) throw error;

        root = d3.hierarchy(root)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

      var focus = root,
      nodes = pack(root).descendants(),
      view;

      var circle = g.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .style("fill", function(d) { return d.children ? color(d.depth) : "white"; })
      .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

      var text = g.selectAll("text")
      .data(nodes)
      .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .each(function(d) {
        var name=d.data.name.replace(/\uFFFD/g, 'é')
        var arr = name.split(" ");
        i = 0;

        if ((arr != undefined) && (arr.length > 2)) {
            while (i < arr.length)  {
                label=arr[i]
                i++;
                while ((i%3!=0)&&(arr[i]!=undefined)){
                  label=label+" "+arr[i]
                  i++;
                }
                d3.select(this).append("tspan")
                    .text(label)
                    .attr("dy", i ? "1.2em" : 0)
                    .attr("x", 0)
                    .attr("text-anchor", "middle")
                    .attr("class", "tspan" + i);
            }
        }
        else{
          d3.select(this).append("tspan")
              .text(arr[i]+" "+arr[i+1])
              .attr("dy", i ? "1.2em" : 0)
              .attr("x", 0)
              .attr("text-anchor", "middle")
        }
      });

      var node = g.selectAll("circle,text");

      svg
      .style("background", color(-1))
      .on("click", function() { zoom(root); });

      zoomTo([root.x, root.y, root.r * 2 + margin]);

      function zoom(d) {
        var focus0 = focus; focus = d;

        var transition = d3.transition()
          .duration(d3.event.altKey ? 7500 : 750)
          .tween("zoom", function(d) {
            var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
            return function(t) { zoomTo(i(t)); };
          });

        transition.selectAll("text")
          .filter(function(d) { return d.parent === focus || (d.height===0) || this.style.display === "inline"; })
          .style("fill-opacity", function(d) { return ((d.parent === focus) || (d === focus & d.height===0))? 1 : 0; })
          .on("start", function(d) {
            if (d.parent === focus)
              this.style.display = "inline";
            if(d === focus0 & d.height===0) {
              removeDetails(this);
              if (d.parent !== focus)
                this.style.display = "none";
            }
          })
          .on("end", function(d) {
            if (d.parent !== focus)
              this.style.display = "none";
            else{
              this.style.display = "inline";
            }

            if(d === focus & d.height===0){
              addDetails(this,d);
              this.style.display = "inline";
            }
          });
      }

      function addDetails(textNode,d){
        d3.select(textNode.firstChild)
          .attr("dy", "-100");

        d3.select(textNode).append("tspan")
          .text(d.data.size)
          .attr("text-anchor", "middle")
          .attr("style", "font-weight: bold;" +
            "font-size: 50px;")
          .attr("y", "25")
          .attr("x", 0);
      }

      function removeDetails(textNode){
        textNode.removeChild(textNode.lastChild);
        d3.select(textNode.firstChild)
          .attr("dy", "0");
      }

      function zoomTo(v) {
        var k = diameter / v[2]; view = v;
        node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
        circle.attr("r", function(d) { return d.r * k; });
      }
    });
}

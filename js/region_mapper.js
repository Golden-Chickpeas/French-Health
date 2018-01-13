/**
* region_mapper.js contains all necessary functions for the
* update of the selected region's visualised data, which are usually means of some kind
*
* @file Contains the necessary functions for visualising regions food facts
* @author Valentina Zelaya & Timothy Garwood
* @version 1.0
*/


// Hide all elements with class="containerTab", except for the one that matches the clickable grid column
function openTab(tabName) {
    var i, x;
    x = document.getElementsByClassName("containerTab");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    console.log(tabName);
    document.getElementById(tabName).style.display = "block";
}

function displayVisualisationAccessBar(show){
  if (show) document.getElementById("visu_accesser").style.display = "block";
  else  document.getElementById("visu_accesser").style.display = "none";
}

function closeVisualisation(tabName){
  document.getElementById(tabName).style.display='none';
}

function goto_region(d,reg_num){
  var x, y, k;

  if (d && centered !== d) {
    var centroid = geopath.centroid(d);
    x= centroid[0]+80;
    y=centroid[1]+80;
    // x = d3.event.pageX-150;
    // y = d3.event.pageY;
    k = 3;
    centered = d;

    //  When a region is clicked display visualisation bar
    displayVisualisationAccessBar(true);

    // Create displayable visualisations on viusalisation access tabs

    // First tab : circle packing
    region_foodgrp_hierarchy_data='data/json/foodgrp_sougrp_conso_week/region'+reg_num+'/consos_grp_'+window.selected_foodgrp+'_region_'+reg_num+'.json'
    load_circle_packing(region_foodgrp_hierarchy_data)

    //Second tab : Icicle
    region_foodgrp_partition_data='data/json/foodgrp_conso_partition/region'+reg_num+'/consos_partition_'+window.selected_foodgrp+'_region_'+reg_num+'.json'
    load_icicle(region_foodgrp_partition_data)


  } else {
    x = width / 3.2;
    y = height / 1.4;
    k = 1;
    centered = null;
    closeVisualisation('week_circle_pack')
    displayVisualisationAccessBar(false)
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
    .attr("id", "circle_pack") .attr("width",width/3.4) .attr("height",height/1.4),
    margin = 2,
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


function load_icicle(data_file_path){

  var svg = d3.select("#icicle").append("svg")
  .attr("id", "icicle") .attr("width",width/3.4) .attr("height",height/1.4),
  margin = 5;
  var rect = svg.selectAll("rect");

    var x = d3.scaleLinear()
        .range([0, width/3.4]);

    var y = d3.scaleLinear()
        .range([0, height/1.4]);

    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    var partition = d3.partition()
        .size([width/3.4, height/1.4])
        .padding(0)
        .round(true);


    d3.json(data_file_path, function(error, root) {
      // if (error) throw error;

      root = d3.hierarchy(d3.entries(root)[0], function(d) {
          return d3.entries(d.value)
        })
        .sum(function(d) { return d.value })
        .sort(function(a, b) { return b.value - a.value; });

      partition(root);

      rect = rect
          .data(root.descendants())
        .enter().append("rect")
          .attr("x", function(d) { return d.x0; })
          .attr("y", function(d) { return d.y0; })
          .attr("width", function(d) { return d.x1 - d.x0; })
          .attr("height", function(d) { return d.y1 - d.y0; })
          .attr("fill", function(d) { return color((d.children ? d : d.parent).data.key); })
          .on("click", clicked);
    });

    function clicked(d) {
      x.domain([d.x0, d.x1]);
      y.domain([d.y0, height/1.4]).range([d.depth ? 20 : 0, height/1.4]);

      rect.transition()
          .duration(750)
          .attr("x", function(d) { return x(d.x0); })
          .attr("y", function(d) { return y(d.y0); })
          .attr("width", function(d) { return x(d.x1) - x(d.x0); })
          .attr("height", function(d) { return y(d.y1) - y(d.y0); });
    }

}

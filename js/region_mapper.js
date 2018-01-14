/**
* region_mapper.js contains all necessary functions for the
* update of the selected region's visualised data, which are usually means of some kind
*
* @file Contains the necessary functions for visualising regions food facts
* @author Valentina Zelaya & Timothy Garwood
* @version 1.0
*/

region_names={"1":"Région Parisienne", "2":"Champagne","3":"Picardie","4":"Haute-Normandie",
"5":"Centre","6":"Basse-Normandie","7":"Bourgogne", "8":"Nord", "9":"Lorraine","10":"Alsace",
"11":"Franche Comté","12":"Pays de la Loire", "13":"Bretagne","14":"Poitou Charentes",
"15":"Aquitaine","16":"Midi-Pyrénées","17":"limousin","18":"Rhône-Alpes","19":"Auvergne",
"20":"Languedoc","21":"Provence Côte d'Azur"};

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

function closeVisualisation(visuName){
  console.log(visuName);
  document.getElementById(visuName).style.display='none';
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

    var reg_descrip=document.getElementById('description');
    reg_descrip.innerHTML='<h3>'+region_names[reg_num]+'</h3>';

    //  When a region is clicked display visualisation bar
    displayVisualisationAccessBar(true);

    // Create displayable visualisations on viusalisation access tabs

    // First tab : circle packing
    region_foodgrp_hierarchy_data='data/json/foodgrp_sougrp_conso_week/region'+reg_num+'/consos_grp_'+window.selected_foodgrp+'_region_'+reg_num+'.json'
    load_circle_packing(region_foodgrp_hierarchy_data)

    //Second tab : Icicle
    region_foodgrp_partition_data='data/json/foodgrp_conso_partition/region'+reg_num+'/consos_partition_'+window.selected_foodgrp+'_region_'+reg_num+'.json'
    load_icicle(region_foodgrp_partition_data)

    display_meal_timeline(reg_num);


  } else {
    x = width / 3.2;
    y = height / 1.4;
    k = 1;
    centered = null;
    closeVisualisation('week_circle_pack');
    closeVisualisation('icicle_container');
    closeVisualisation('timeline_visu');
    displayVisualisationAccessBar(false);
    var reg_descrip=document.getElementById('description');
    reg_descrip.innerHTML='<h3> Santé et habitudes alimentaires en France</h3>';
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
    .attr("id", "circle_pack") .attr("width",width/2.5) .attr("height",height/1.4),
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
      .attr("class", "label circle_text")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .each(function(d) {
        var name=d.data.name
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

        transition.selectAll("text.circle_text")
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

  //Remove the previous representations
  d3.select('#icicle_visu').remove();
  d3.select('#trail').remove();

  var vis = d3.select("#icicle_container").append("svg")
  .attr("id", "icicle_visu") .attr("width",width/2.5) .attr("height",height/1.4),
  margin = 5;

  // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
    var b = {w: 150, h: 30, s: 3, t: 10};

    var rect = vis.selectAll("rect");
    var fo = vis.selectAll("foreignObject")
                .style('fill', 'black');
    var totalSize=0;


    var x = d3.scaleLinear()
        .range([0, width/2.5]);

    var y = d3.scaleLinear()
        .range([0, height/1.4]);

    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    var partition = d3.partition()
        .size([width/2.5, height/1.4])
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


      var formatNumber = d3.format(",d");

      rect = rect
          .data(root.descendants())
        .enter().append("rect")
          .attr("x", function(d) { return d.x0; })
          .attr("y", function(d) { return d.y0; })
          .attr("width", function(d) { return d.x1 - d.x0; })
          .attr("height", function(d) { return d.y1 - d.y0; })
          .attr("stroke", "rgb(0,0,0)")
          .attr("fill", function(d) { return color((d.children ? d : d.parent).data.key); })
          .on("click", clicked);


      fo = fo
    		.data(root.descendants())
    		.enter().append("foreignObject")
        .on("click", clicked)
          .attr("x", function(d) { return d.x0; })
          .attr("y", function(d) { return d.y0; })
          .attr("width", function(d) { return d.x1 - d.x0; })
          .attr("height", function(d) { return d.y1 - d.y0; })
          .style("cursor", "pointer")
          .text(function(d) { return d.children ? d.data.key : formatNumber(d.value);})
          .attr("fill","black");

    	 //get total size from rect
    	totalSize = rect.node().__data__.value;
    });

    function clicked(d) {
      x.domain([d.x0, d.x1]);
      y.domain([d.y0, height/1.4]).range([d.depth ? 20 : 0, height/1.4]);

      rect.append("title")
          .text(function(d){return d.data.key;});

      rect.transition()
          .duration(750)
          .attr("x", function(d) { return x(d.x0); })
          .attr("y", function(d) { return y(d.y0); })
          .attr("width", function(d) { return x(d.x1) - x(d.x0); })
          .attr("height", function(d) { return y(d.y1) - y(d.y0); });

      fo.transition()
        .duration(750)
        .attr("x", function(d) { return x(d.x0); })
        .attr("y", function(d) { return y(d.y0); })
        .attr("width", function(d) { return x(d.x1-d.x0); })
        .attr("height", function(d) { return y(d.y1-d.y0); });

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
      var trail = d3.select("#breadcrumb").append("svg")
          .attr("width", width/2.5)
          .attr("height", 50)
          .attr("id", "trail");
      // Add the label at the end, for the percentage.
      trail.append("text")
        .attr("id", "endlabel")
        .style("fill", "#000");

    	  // Make the breadcrumb trail visible, if it's hidden.
      d3.select("#trail")
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

      // Data join; key function combines name and depth (= position in sequence).
      var trail = d3.select("#trail")
          .selectAll("g")
          .data(nodeArray, function(d) { return d.data.key; });

      // Remove exiting nodes.
      trail.exit().remove();

      // Add breadcrumb and label for entering nodes.
      var entering = trail.enter().append("g");

      entering.append("polygon")
          .attr("points", breadcrumbPoints)
          .style("fill", function(d) { return color((d.children ? d : d.parent).data.key); });

      entering.append("text")
          .attr("x", (b.w + b.t) / 2)
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(function(d) { return d.data.key.length<15 ? d.data.key + d.depth : d.data.key.substring(0,16); });

      entering.append("title")
          .attr("x", (b.w + b.t) / 2)
          .attr("y", b.h / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .text(function(d) { return d.data.key; });

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

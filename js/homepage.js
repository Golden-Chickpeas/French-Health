/**
* homepage.js contains all necessary functions for the homepage of this visualisation project to function, from displaying the home page with France's map
* to charging up the data, giving information and previews, and switching up the visualisations
* @file Contains the necessary functions for the home page behaviour
* @author Valentina Zelaya & Timothy Garwood
* @version 1.0
*/
//HISTORY : January 1st 2018 - Initial design and coding (@vz-chameleon)


/**
* A function to initialize homepage
* Here is where we load France's regions map
*/
function initHomepage(){

  var width = $(window).width();
  var height = $(window).height();


  //------- FRANCE'S MAP SET UP (OLD REGIONS, before 2015) ------

  // Create a path object to manipulate geoJSON data
  var geopath = d3.geoPath();

  // Define projection property
  var projection = d3.geoConicConformal() // Lambert-93
  		               .center([2.454071, 46.279229]) // Center on France
  		               .scale(3000)
  		               .translate([300,300]);

  geopath.projection(projection); // Assign projection to path object

  // Add svg HTML tag to DOM
  var svg = d3.select('#france_map').append("svg")
  		        .attr("id", "svg")
  		        .attr("width",width)
  		        .attr("height", height/1.4);

  // Append the group that will contain our paths
  var fr_regions = svg.append("g");

  var regionTooltip = d3.select("body").append("div")
    .attr("class", "tooltip ")
    // .style("opacity", 0)
    .attr("id","regionTooltip");

  d3.json('data/regions-avant-redecoupage-2015.geojson', function(error,geojson) {
    fr_regions.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr('class', 'France_region')
        .attr('id', function (data) {
			    return "r" + data.properties.code;
        })
        .attr("d", geopath)
        .on("mouseover", function(d) {
          regionTooltip.transition()
                .duration(200)
                .style("opacity", .8);
          regionTooltip.html(" <b> Région </b> : " + d.properties.nom)
                .style("left", (d3.event.pageX + 30) + "px")
                .style("top", (d3.event.pageY - 30) + "px")
        })
        .on("mouseout", function(d) {
          regionTooltip.transition()
                .duration(500)
                .style("opacity", 0);
          regionTooltip.html("")
                .style("left", "0px")
                .style("top", "0px");
        });

      });
    $( window ).on( "load", function() {
        $("#r94").attr("display","none"); //hiding Corsica for which we have no data
    });

      // --- Navbar controllers initialize ----

      $('.btn-expand-collapse').click(function(e) {
      				$('.navbar-primary').toggleClass('collapsed');
      });

      $('.lowest-layer-nav').click(function(e) {
        $this = this;
        $('.top-layer-nav').filter(".panel-heading").each(function (value) {
          potentialParent = this.nextElementSibling;
          if (!$(this).hasClass("collapsed") & $(potentialParent).has($this).length!=1) {
            console.log("should click here")
            this.click();
          }
          });

        updateMeansMap($(this).text());
          console.log($(this).text());
          ApplyFilterToMap()
      });

      $('.top-layer-nav').filter(".panel-heading").on('mouseenter',function(e) {
        // console.log(this)
        if ($(this).hasClass("collapsed")) {
          $(this).click();
          $('.top-layer-nav').filter(".panel-heading").not(this).not(".collapsed").click();

        }

      });

      $('.filter').click(function() {
        var id = this.firstChild.id;
        var id_splitted = id.split('_');
        var filter_type = id_splitted[0];
        var filter_option_number = id_splitted[2];
        UpdateFilters(filter_type,filter_option_number);
        ApplyFilterToMap()
      });
}

/**
* means_mapper.js contains all necessary functions for the
* update of the map's visualised data, which are usually means of some kind
*
* @file Contains the necessary functions for the home page behaviour
* @author Valentina Zelaya & Timothy Garwood
* @version 1.0
*/

var region_num_to_postal_code_map={"1":"11",
"2":"21","3":"22","4":"23","5":"24","6":"25","7":"26","8":"31","9":"41",
"10":"42","11":"43","12":"52","13":"53","14":"54","15":"72","16":"73",
"17":"74","18":"82","19":"83","20":"91","21":"93"};

var numberOfQuantiles = 6;
var centered;

window.loaded_file_path;
window.loaded_filters=["",""];
window.quantile;
window.selected_foodgrp;


function display_dataset(data, unit){

  // Define color scale
  window.quantile = d3.scaleQuantile()
      .domain([d3.min(data, function (e) { return +e.mean; }), d3.max(data, function (e) { return +e.mean; })])
      .range(d3.range(numberOfQuantiles));

  //console.log(quantile)
  // Read data from csv and put it on the map

    var regionTooltip = d3.select("#regionTooltip");


    data.forEach(function (e, i) { // For each item in the csv file
          // console.log(e);
          // // console.log(e.reg_code);
          // console.log(region_num_to_postal_code_map[e.reg_code]);

          //Select a region in the map, we need a correct code for that
          d3.select("#r" + region_num_to_postal_code_map[e.reg_code])
            .attr("class", function (d) {
              //console.log(quantile(+e.mean));
              return "France_region q" + quantile(+e.mean);
            })
            .on("mouseover", function(d) {
              regionTooltip.transition()
                  .duration(200)
                  .style("opacity", .8);
              regionTooltip.html(" <b> Région </b> : " + d.properties.nom
                +"<br>"+
                "Nombre d'individus concernés :"+ e.indiv_num
                +"<br>"+
                "Valeur précise :"+ parseFloat(e.mean).toFixed(2)
              )
                  .style("left", (d3.event.pageX + 30) + "px")
                  .style("top", (d3.event.pageY - 30) + "px")
              })
              .on("click", function(d){
                 goto_region(d,e.reg_code)
              })
    });

    update_legend(quantile,numberOfQuantiles, unit)
}

function update_legend(quantile_func,nb_quantiles, unit){
  // Delete the previous legend (if there is none, nothing happens)
  d3.select('#legend').remove();
  var width=800; var height=600;

  var legend = d3.select('svg').append("g")
    .attr("transform", "translate(" + Math.round((width / 2) + width * 0.2) + ", " + Math.round(height / 2) + ")")
    .attr("id", "legend");

  var background = legend.append("svg:rect")
    .classed("legend-background", true);

  legend.selectAll(".colorbar")
    .data(d3.range(nb_quantiles))
    .enter()
    .append("svg:rect")
    .attr("y", function (d) { return d * 20 + "px"; })
    .attr("height", "20px")
    .attr("width", "30px")
    .attr("x", "0px")
    .attr("class", function (d) { return "q" + d ; });

  // Add legend to each color
  legend.selectAll(".colorbar")
    .data(d3.range(nb_quantiles))
    .enter()
    .append("text")
    .attr("x", "30px")
    .attr("y", function (d) { return (d * 21 + 12) + "px"; })
    .text(function (d) {
      switch(d) {
        case 0 :
          return "< " + Math.round(quantile_func.quantiles()[0]) + " " + unit;
          break;
        case nb_quantiles-1 :
          return "> " + Math.round(quantile_func.quantiles()[nb_quantiles-2]) + " "+ unit;
          break;
        default :
          return Math.round(quantile_func.quantiles()[d-1]) + " - " + Math.round(quantile_func.quantiles()[d]) + " "+ unit ;
          break;

      }

    })
    .attr("id","legendText");

  background
    .attr("height",legend._groups[0][0].getBBox().height)
    .attr("width",legend._groups[0][0].getBBox().width)
    .attr("x","-1px")
    .attr("y","-4px");

}

function updateMeansMap(category){
  category=category.toLowerCase();
  // alert("Updating means with :"+category);
  var file_path;
  var category_mapped;
  var color_scale;
  switch(category){
    case "petit-déjeuner":
      file_path= "data/csv/duree_repas_mean/duree_repas_mean_of_tyrep_Petit-dejeuner.csv";
      category_mapped = "minutes";
      color_scale = "breakfast_shades";
      window.selectedMeal = 1;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "déjeuner":
      file_path= "data/csv/duree_repas_mean/duree_repas_mean_of_tyrep_Dejeuner.csv";
      category_mapped = "minutes";
      color_scale = "lunch_shades";
      window.selectedMeal = 3;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "dîner":
      file_path= "data/csv/duree_repas_mean/duree_repas_mean_of_tyrep_Diner.csv";
      category_mapped = "minutes";
      color_scale = "dinner_shades";
      window.selectedMeal = 5;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "eau":
      file_path= "data/csv/foodgrp_conso_means/conso_of_codgr_31.csv";
      category_mapped = "mL/jour";
      color_scale = "blue_shades";
      window.selected_foodgrp=31;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "boissons alcoolisées":
      file_path= "data/csv/foodgrp_conso_means/conso_of_codgr_33.csv";
      category_mapped = "mL/jour";
      color_scale = "bottle_shades";
      window.selected_foodgrp=33;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "pain et panification":
      file_path= "data/csv/foodgrp_conso_means/conso_of_codgr_1.csv";
      category_mapped = "g/jour";
      color_scale = "dark_gold_shades";
      window.selected_foodgrp=1;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "pâtisseries et gâteaux":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_8.csv";
      category_mapped = "g/jour";
      color_scale = "piepink_shades";
      window.selected_foodgrp=8;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "ultra-frais laitier":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_10.csv";
      category_mapped = "g/jour";
      color_scale = "grey_shades";
      window.selected_foodgrp=10;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "fromages":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_11.csv";
      category_mapped = "g/jour";
      color_scale = "light_gold_shades";
      window.selected_foodgrp=11;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "légumes":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_23.csv";
      category_mapped = "g/jour";
      color_scale = "spinach_shades";
      window.selected_foodgrp=23;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "fruits":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_26.csv";
      category_mapped = "g/jour";
      color_scale = "fruit_shades";
      window.selected_foodgrp=26;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "viande":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_17.csv";
      category_mapped = "g/jour";
      color_scale = "red_shades";
      window.selected_foodgrp=17;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "charcuterie":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_20.csv";
      category_mapped = "g/jour";
      color_scale = "salami_shades";
      window.selected_foodgrp=20;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "poissons":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_21.csv";
      category_mapped = "g/jour";
      color_scale = "fishy_shades";
      window.selected_foodgrp=21;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "beurre":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_13.csv";
      category_mapped = "g/jour";
      color_scale = "butter_shades";
      window.selected_foodgrp=13;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "huile":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_14.csv";
      category_mapped = "mL/jour";
      color_scale = "olive_shades";
      window.selected_foodgrp=14;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "sandwichs":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_37.csv";
      category_mapped = "g/jour";
      color_scale = "sandwich_shades";
      window.selected_foodgrp=37;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "plats composés":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_39.csv";
      category_mapped = "g/jour";
      color_scale = "composed_shades";
      window.selected_foodgrp=39;
      window.selectedMeal = undefined;
      window.sportSelected = false;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "sedentarisme quotidien":
      file_path= "data/csv/sedentary_means/sedentary_dailytime_region_mean.csv";
      category_mapped = "minutes/jour";
      color_scale = "tv_shades";
      window.selectedMeal = undefined;
      window.sportSelected = true;
      load_dataset(file_path,category_mapped,color_scale);
      break;

    default:
        alert("No file found for selected food group !")
        break;
  }
}

function load_dataset(file_path, category_mapped, color_scale) {
    window.loaded_file_path = file_path;

    d3.text(file_path,
        function (error, raw) { if (error) alert(error);
            var dsv=d3.dsvFormat(';');
            var data=dsv.parse(raw);
            // console.log(window.loaded_file_path);
            display_dataset(data, category_mapped);});
    $("#france_map svg").attr("class", color_scale);

    if (typeof window.selectedRegion !== 'undefined') {
      goto_region(window.clickedOnreg,window.selectedRegion)
    }
}

function FilterMeansMap(filter_type, option){
    UpdateFilters(filter_type,option);
    ApplyFilterToMap()
}

function UpdateFilters(filter_type, option) {
    console.log("updating filters with : "+filter_type+" .. "+option);
    var sex_filter= window.loaded_filters[0];
    var revenu_filter = window.loaded_filters[1];
    console.log("current filters "+window.loaded_filters);

    if (filter_type === "sexe") {
        console.log("sex fiter");
        if (option == "0")
            sex_filter = "";
        else
            sex_filter = "_of_sexe_" + option;
    }
    else {
        if (option == "0")
            revenu_filter = "";
        else
            revenu_filter = "_of_revenu_foyer_" + option;
    }

    console.log("new filters : "+sex_filter+","+revenu_filter);
    window.loaded_filters=[sex_filter,revenu_filter];

}

function ApplyFilterToMap(){
    var currently_loaded_file=window.loaded_file_path;

    var new_file_path = currently_loaded_file.substr(0,currently_loaded_file.length-4)+loaded_filters[0]+loaded_filters[1]+".csv";

    // console.log("new filepath"+new_file_path);

    d3.text(new_file_path,
        function (error, raw) {
            if (error) alert(error);
            else {
                var dsv = d3.dsvFormat(';');
                var data = dsv.parse(raw);

                var regionTooltip = d3.select("#regionTooltip");
                data.forEach(function (e, i) { // For each item in the csv file
                    // console.log(e);
                    // // console.log(e.reg_code);
                    // console.log(region_num_to_postal_code_map[e.reg_code]);

                    //Select a region in the map, we need a correct code for that
                    d3.select("#r" + region_num_to_postal_code_map[e.reg_code])
                        .attr("class", function (d) {
                            //console.log(quantile(+e.mean));
                            return "France_region q" + quantile(+e.mean);
                        })
                        .on("mouseover", function(d) {
                            regionTooltip.transition()
                                .duration(200)
                                .style("opacity", .8);
                              regionTooltip.html(" <b> Région </b> : " + d.properties.nom
                                +"<br>"+
                                "Nombre d'individus concernés :"+ e.indiv_num
                                +"<br>"+
                                "Valeur précise :"+ parseFloat(e.mean).toFixed(2)
                              )
                                .style("left", (d3.event.pageX + 30) + "px")
                                .style("top", (d3.event.pageY - 30) + "px")
                        })
                  });
            }
        });
}

/**
* means_mapper.js contains all necessary functions for the
* update of the map's visualised data, which are usually means of some kind
*
* @file Contains the necessary functions for the home page behaviour
* @author Valentina Zelaya & Timothy Garwood
* @version 1.0
*/
//HISTORY : January 1st 2018 - Initial design and coding (@vz-chameleon)

var region_num_to_postal_code_map={"1":"11",
"2":"21","3":"22","4":"23","5":"24","6":"25","7":"26","8":"31","9":"41",
"10":"42","11":"43","12":"52","13":"53","14":"54","15":"72","16":"73",
"17":"74","18":"82","19":"83","20":"91","21":"93"};

var numberOfQuantiles = 6;
window.loaded_file_path;
window.loaded_filters=["",""];
window.quantile;

function display_dataset(data, mappedCategory){

  // Define color scale
  window.quantile = d3.scaleQuantile()
      .domain([d3.min(data, function (e) { return +e.mean_qte_brute; }), d3.max(data, function (e) { return +e.mean_qte_brute; })])
      .range(d3.range(numberOfQuantiles));

  //console.log(quantile)
  // Read data from csv and put it on the map

    data.forEach(function (e, i) { // For each item in the csv file
          // console.log(e);
          // // console.log(e.reg_code);
          // console.log(region_num_to_postal_code_map[e.reg_code]);

          //Select a region in the map, we need a correct code for that
          d3.select("#r" + region_num_to_postal_code_map[e.reg_code])
                .attr("class", function (d) {
                        //console.log(quantile(+e.mean_qte_brute));
                        return "France_region q" + quantile(+e.mean_qte_brute);
                    });
    });

    update_legend(quantile,numberOfQuantiles)
}

function update_legend(quantile_func,nb_quantiles){
  // Delete the previous legend (if there is none, nothing happens)
    d3.select('#legend').remove();
  var width=800; var height=600;

    var legend = d3.select('svg').append("g")
             .attr("transform", "translate(" + Math.round((width / 2) + width * 0.2) + ", " + Math.round(height / 2) + ")")
            .attr("id", "legend");

  //Data units default
  var unit = "g/jour";

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
}

function updateMeansMap(category){
  category=category.toLowerCase();
  // alert("Updating means with :"+category);
  var file_path;
  var category_mapped;
  var color_scale;
  switch(category){
    case "pain et panification":
      file_path= "data/csv/foodgrp_conso_means/conso_of_codgr_1.csv";
      category_mapped = "pains";
      color_scale = "dark_gold_shades";
      load_dataset(file_path,category_mapped,color_scale);
      break;

    case "céréales pour petit déjeuner":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_2.csv";
      category_mapped = "cereales_pdej";
      color_scale = "light_gold_shades";
      load_dataset(file_path,category_mapped,color_scale);

      //   d3.text(filePath,
      // function (error, raw) { if (error) alert(error);
      //   var dsv=d3.dsvFormat(';');
      //   var data=dsv.parse(raw);
      //   display_dataset(data, "cereales_pdej");});
      //   $("#france_map svg").attr("class", "light_gold_shades");
      break;

    case "pâtisseries et gâteaux":
      file_path = "data/csv/foodgrp_conso_means/conso_of_codgr_8.csv";
      category_mapped = "patisserie";
      color_scale = "grey_shades";
      load_dataset(file_path,category_mapped,color_scale);
      //
      // d3.text(filePath,
      // function (error, raw) { if (error) alert(error);
      //   var dsv=d3.dsvFormat(';');
      //   var data=dsv.parse(raw);
      //   display_dataset(data, "patisserie");});
      //   $("#france_map svg").attr("class", "grey_shades");
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
            console.log(window.loaded_file_path);
            display_dataset(data, category_mapped);});
    $("#france_map svg").attr("class", color_scale);
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

    console.log("new filepath"+new_file_path);

    d3.text(new_file_path,
        function (error, raw) {
            if (error) alert(error);
            else {
                var dsv = d3.dsvFormat(';');
                var data = dsv.parse(raw);
                data.forEach(function (e, i) { // For each item in the csv file
                    //Select a region in the map, we need a correct code for that
                    d3.select("#r" + region_num_to_postal_code_map[e.reg_code])
                        .attr("class", function (d) {
                            //console.log(quantile(+e.mean_qte_brute));
                            return "France_region q" + window.quantile(+e.mean_qte_brute);
                        });
                });
            }
        });
}
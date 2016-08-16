var ich = require("icanhaz");
var $ = require("jquery");
var tooltipTemplate = require("./_tooltipTemplate.html");
ich.addTemplate("tooltipTemplate", tooltipTemplate);

//var light-gray =  "#CCCCCC";
//var medium-gray = "#B2B2B2";

// var restaurants = [
//   { name: "A16", color: "#7D7B4C", dish: "Magherita pizza" },
//   { name: "Greens", color: "#4C4E7D", dish: "Mesquite-grilled brochettes" },
//   { name: "House of Prime Rib", color: "#7D4C67", dish: "Prime rib cut" },
//   { name: "Slanted Door", color: "#4C767D", dish: "Shaking beef" },
//   { name: "Yank Sing", color: "#6B4C7D", dish: "Steamed BBQ pork buns" },
//   { name: "Zuni Cafe", color: "#7D534C", dish: "Roast chicken for two" },
// ];

var restaurants = [
  { name: "Yank Sing", color: "#393939", dish: "Steamed BBQ pork buns" },
  { name: "A16", color: "#727272", dish: "Margherita pizza" },
  { name: "Slanted Door", color: "#7485AB", dish: "Shaking beef" },
  { name: "Greens", color: "#59A3AB", dish: "Mesquite-grilled brochettes" },
  { name: "House of Prime Rib", color: "#3F61AB", dish: "H.O.P.R. cut" },
  { name: "Zuni Cafe", color: "#083496", dish: "Roast chicken for two" },
];

var years = [1995, 2000, 2005, 2010, 2013, 2015, 2016];
var years_percent = [2000, 2005, 2010, 2013, 2015, 2016];
var years_events = [2004, 2008, 2010];
var years_descriptions = ["SF sets minimum wage", "SF Health Security Ord.", "ACA in effect"]
var graphMetric = "priceadj";
var num_years = 7;

var width = 620;
var height = 320;
var leftOffset = 55;
var topOffset = 25;
var chartHeight = 250;

var canvas = document.querySelector("canvas");
if (canvas) {

  var ctx = canvas.getContext("2d");

  var render = function(index) {

    if (graphMetric == "percent") {
      var vertical_inc = 10;
      var top_percent = 50;
      var num_inc = 8;
      var yaxis_label_offset = 50;
      var yaxis_title_offset = 5;
      var zero_line = 5; //number of tick marks before zero
    } else {
      var vertical_inc = 5;
      var top_percent = 60;
      var num_inc = 12;
      var yaxis_label_offset = 50;
      var yaxis_title_offset = 5;
      var zero_line = 12; //number of tick marks before zero
    }

    var chartWidth = width - leftOffset;
    var indexWidth = chartWidth / num_years;
    var indexHeight = chartHeight / num_inc;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#E5E5E5";
    ctx.fillRect(0,0, width, height);

    // hover bars
    if (typeof index !== "undefined") {
      ctx.fillStyle = "#B2B2B2";
      ctx.fillRect(index * indexWidth + leftOffset, 0, indexWidth, height);
      ctx.fillStyle = "#CCCCCC";
      ctx.fillRect(index * indexWidth + leftOffset, height-35, indexWidth, height);
    }

    // graph lines
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(192, 192, 192)';
    ctx.lineWidth = 1;
    ctx.moveTo(leftOffset, topOffset);
    ctx.lineTo(chartWidth + leftOffset, topOffset);
    for (var i = 1; i < (num_inc+1); i++) {
      ctx.moveTo(leftOffset,indexHeight*i + topOffset);
      ctx.lineTo(chartWidth + leftOffset, indexHeight * i + topOffset);
    };
    ctx.stroke();

    // make zero line bolder
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(126, 131, 139)';
    ctx.lineWidth = 2;
    ctx.moveTo(leftOffset, indexHeight*zero_line + topOffset);
    ctx.lineTo(chartWidth + leftOffset, indexHeight*zero_line + topOffset);
    ctx.stroke();

    // year labels
    var i = indexWidth/2 + leftOffset;
    //ctx.font = "bold 14px helvetica";
    ctx.font ="13px AntennaMedium";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";
    years.forEach(function(year){
      ctx.fillText(year, i, height - 18); //WHAT IS THIS "18"??????????
      i += indexWidth;
    });

    // percent labels
    var percent = top_percent;
    ctx.font = "13px helvetica";
    ctx.textBaseline = "middle";
    ctx.textAlign = "right";
    ctx.fillStyle = "#000000";
    for (var i = 0; i < (num_inc+1); i++) {
      ctx.fillText(percent, yaxis_label_offset, indexHeight * i + topOffset);
      percent -= vertical_inc;
    };

    // percent label name
    ctx.rotate(-(Math.PI/180)*90);
    ctx.textBaseline = "top";
    ctx.textAlign = "center";
    ctx.strokeStyle = "#000000";
    ctx.font = "15px helvetica";

    if (graphMetric == "price") {
      var ylabel_title = "Cost in dollars";
    } else if (graphMetric == "priceadj") {
      var ylabel_title = "Cost in 2016 dollars";
    } else if (graphMetric == "percent") {
      ylabel_title = "Percent change in cost";
    }
    ctx.fillText(ylabel_title, -(chartHeight/2 + topOffset), yaxis_title_offset);
    ctx.rotate((Math.PI/180)*90);

    // event lines
    ctx.beginPath();
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    var idx = 0;
    years_events.forEach(function(year_event){
      var years = year_event-1995;
      i = leftOffset+indexWidth/5*(years+2.5);
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.moveTo(i, height-45);
      ctx.lineTo(i, 30*(idx+1));
      ctx.stroke();
      idx += 1;
    });

    // event labels
    ctx.font ="13px AntennaMedium";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillStyle = "#000000";
    var idx = 0;
    years_events.forEach(function(year_event){
      var years = year_event-1995;
      i = leftOffset+indexWidth/5*(years+2.5);
      ctx.fillText(years_descriptions[idx], i+15, 30*(idx+1)-15);
      idx += 1;
    });

    // data lines
    restaurants.forEach(function(restaurant) {
      var points = [];
      if (graphMetric == "price") {
        years.forEach(function(year) {
            var point = RestaurantData[restaurant.name][year].price;
            points.push(point);
        });
      } else if (graphMetric == "priceadj") {
        years.forEach(function(year) {
            var point = RestaurantData[restaurant.name][year].priceadj;
            points.push(point);
        });
      } else if (graphMetric == "percent")
      years_percent.forEach(function(year) {
            var point = RestaurantData[restaurant.name][year].percent;
            points.push(point);
      });
      ctx.beginPath();
      // ctx.strokeStyle = "rgb(" + county.color + ")";
      ctx.strokeStyle = restaurant.color;
      ctx.lineWidth = 1.5;

      if (graphMetric == "percent") {
        var i = indexWidth/vertical_inc+indexWidth + leftOffset;
      } else {
        var i = indexWidth/vertical_inc + leftOffset;
      }
      points.forEach(function(point) {
        var y = indexHeight*zero_line - (point * indexHeight/vertical_inc) + topOffset;
        if (point != "empty") {
          ctx.lineTo(i+indexWidth/3, y);
          ctx.stroke();
        }
        i += indexWidth;
      });
    });

  };

  render();

  var tooltip = document.querySelector(".tooltip");

  var onmove = function(e) {
    var indexWidth = (canvas.offsetWidth - leftOffset) / num_years;

    if (e.target.tagName.toLowerCase() != "canvas") return;
    var position;
    var bounds = canvas.getBoundingClientRect();
    position = {
      x: e.clientX - bounds.left,
      y: e.clientY - bounds.top
    };

    var index = Math.floor((position.x - leftOffset)/ indexWidth);
    var year = years[index];

    if (index >= 0) {
      tooltip.classList.add("show");

      var values = [];
      restaurants.forEach(function(restaurant) {
        if (restaurant) {
          var name = restaurant.name;
          var dish = restaurant.dish;
          var color = restaurant.color;
          var up = 0;
          var down = 0;
          var same = 0;

          if (graphMetric == "price") {
            var dollar = 1;
            var perc = 0;
            if ((RestaurantData[restaurant.name][year].price) != "empty"){
              var percent = RestaurantData[restaurant.name][year].price;
            }
          } else if (graphMetric == "priceadj") {
            var dollar = 1;
            var perc = 0;
            if ((RestaurantData[restaurant.name][year].priceadj) != "empty"){
              var percent = (RestaurantData[restaurant.name][year].priceadj).toFixed(2);
            }
          } else if (graphMetric == "percent") {
            var dollar = 0;
            var perc = 1;
            if ((RestaurantData[restaurant.name][year].percent) != "empty"){
              console.log("I AM HERE");
              var percent_with_sign = RestaurantData[restaurant.name][year].percent;
              var percent = Math.abs(RestaurantData[restaurant.name][year].percent).toFixed(2);
              var up = percent_with_sign > 0;
              var down = percent_with_sign < 0;
              if (percent == "0.00") {
                var same = 1;
              }
            }
          }
          values.push({
            name: name,
            color: color,
            dish: dish,
            percent: percent,
            dollar: dollar,
            perc: perc,
            up: up,
            down: down,
            same: same
            });
        }
      });

      render(index);

      tooltip.innerHTML = ich.tooltipTemplate({year: year, data: values});

      var tBounds = tooltip.getBoundingClientRect();
      var canvasBounds = document.getElementById("cv").getBoundingClientRect();
      var top = $(document).scrollTop();
      tooltip.style.top = canvasBounds.top+top-tBounds.height-15+"px";
    } else {
      tooltip.classList.remove("show");
    }
  };

  canvas.addEventListener("mousemove", onmove);
  canvas.addEventListener("click", onmove);
  canvas.addEventListener("mouseout", function(e) {
    render();
    tooltip.classList.remove("show");
  });

}

$(".price").click(function() {
  graphMetric = "price";
  $(".price").addClass("active");
  $(".priceadj").removeClass("active");
  $(".percent").removeClass("active");
  render();
});

$(".priceadj").click(function() {
  graphMetric = "priceadj";
  $(".priceadj").addClass("active");
  $(".price").removeClass("active");
  $(".percent").removeClass("active");
  render();
});

$(".percent").click(function() {
  graphMetric = "percent";
  $(".percent").addClass("active");
  $(".price").removeClass("active");
  $(".priceadj").removeClass("active");
  render();
});

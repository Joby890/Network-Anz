angular.module('app.d3', [])

.controller('AnalyzeController', function ($scope, $location, $window, $http, $interval) {

  $scope.data = {};
  $scope.current = {};
  $scope.ips = {};
  // Dimensions of sunburst.
  var width = 1200;
  var height = 800;
  var radius = Math.min(width, height) / 2;

  // Breadcrumb dimensions: width, height, spacing, width of tip/tail.

  // Mapping of step names to colors.
  var colors = {
    "home": "#5687d1",
    "product": "#7b615c",
    "search": "#de783b",
    "account": "#6ab975",
    "other": "#a173d1",
    "end": "#bbbbbb"
  };

  // Total size of all segments; we set this later, after loading the data.
  var totalSize = 0; 

  vis = d3.select("#chart").append("svg:svg")
    .attr("width", width)
    .attr("height", height)
    .append("svg:g")
    .attr("id", "container")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var arc = d3.svg.arc()
    .startAngle(function(d) {
     return d.x; 
    })
    .endAngle(function(d) { return d.x + d.dx; })
    .innerRadius(function(d) { return Math.sqrt(d.y); })
    .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });


  function getData() {
    $http.get("http://localhost:8080/data/all").then(function(data) {
      $scope.data.all = data.data;
      updateData();
    })
  }
  var partition = d3.layout.partition().size([2 * Math.PI, radius * radius]).value(function(d) {
    return d.length; 
  });


  function mouseleave(d) {

  }

  function updateData() {
    final = {};
    final.children = [];
    //Transform data
    Object.keys($scope.data.all).forEach(function(ip) {
      var a = {};
      a.children = $scope.data.all[ip].packets;
      a.ip = ip;
      a.size = a.children.length;
      final.children.push(a)
    })

    var nodes = partition.nodes(final)
    // .filter(function(d) {
    //   return (d.dx > 0.0005); // 0.005 radians = 0.29 degrees
    // });
    var path = vis.data([final]).selectAll("path")
      .data(nodes)
      .enter().append("svg:path")
      .attr("display", function(d) {
        return d.depth ? null : "none"; 
      })
      .attr("d", arc)
      .attr("fill-rule", "evenodd")
      .style("fill", function(d) { return getRandomColor(); })
      .style("opacity", 1)
      .on("mouseover", mouseover);

    d3.select("#container").on("mouseleave", mouseleave);

    // Get total size of the tree = value of root node from partition.
    totalSize = path.node().__data__.value;

  }

  getData();

  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  function mouseover(d) {
    console.log("mouse over")
    var percentage = (100 * d.value / totalSize).toPrecision(3);
    var percentageString = percentage + "%";
    if (percentage < 0.1) {
      percentageString = "< 0.1%";
    }
    var current;
    if(d.children === undefined) {
      current = {
        percentage: percentageString,
        ip: d.ip,
        owner: ipToOwner(d.ip, null)
      }
    } else {
      current = {
        percentage: percentageString,
        packets: d.children.length,
        ip: d.ip,
        owner: ipToOwner(d.ip, null)
      }
    }

    $scope.current = current;
    $scope.$apply();


  }

  function ipToOwner(ip, callback) {
    if($scope.ips[ip] === undefined) {
      $http.get("http://localhost:8080/data/ips").then(function(d1) {
        console.log($scope.ips)
        $scope.ips = d1.data;
        if($scope.ips === undefined) {
          console.log("Could not find ip: "+ ip);
        }
        ipToOwner(ip, callback)
      });
    } else {
      callback && callback($scope.ips[ip])
      return $scope.ips[ip];
    }
  }
})



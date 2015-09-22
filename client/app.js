angular.module('app',['ui.router',"app.d3"])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/raw');

  $stateProvider.state('raw', {
    url: "/raw",
    templateUrl: "/raw.html",
    controller: 'RawController',
  }).state('analyze', {
    url: "/analyze",
    templateUrl: "/analyze.html",
    controller: 'AnalyzeController',
  })
}).controller('RawController', function ($scope, $location, $window, $http, $interval) {
  $scope.data = {};
  var getData = function() {
    var ips = null;
    var i = false;
    $http.get("http://localhost:8080/data/recent").then(function(d1) {
      if(ips === null) {
        i = true;
        $scope.data.packets = d1.data
      } else {
        $scope.data.packets = d1.data
        setIps($scope.data.packets, ips)
      }
      
    })

    $http.get("http://localhost:8080/data/ips").then(function(d1) {
      if(i) {
        setIps($scope.data.packets, d1.data)
      } else {
        ips = d1.data;
      }
    })
  }
  function setIps(packets, ips) {
    packets.forEach(function(i) {

      if(ips[i.ip] !== undefined) {
        i.owner = ips[i.ip];
      }
    })
  }
  $interval(function() {getData()}, 25);
})
.factory('d3Service', [function() {
     var d3;
    // insert d3 code here
    return d3;
}])
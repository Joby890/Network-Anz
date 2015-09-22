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
    $http.get("http://localhost:8080/data/recent").then(function(d1) {
      
      $scope.data.packets = d1.data
    })
  }

  $interval(function() {getData()}, 25);
})
.factory('d3Service', [function() {
     var d3;
    // insert d3 code here
    return d3;
}])
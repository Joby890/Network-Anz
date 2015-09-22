angular.module('app',['ui.router'])

.config(function($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/raw');

  $stateProvider.state('raw', {
    url: "/raw",
    templateUrl: "/raw.html",
    controller: 'RawController',
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
'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.view1',
    'HeimdallrService'
  ])
  .config(['$routeProvider', 'HeimdallrProvider', function ($routeProvider, HeimdallrProvider) {
    HeimdallrProvider.$get().bindHttp();
    $routeProvider.otherwise({redirectTo: '/view1'});
  }])
  .run(['HeimdallrService', function (HeimdallrService) {
    HeimdallrService.init({
      url: '/monitoring/perf',
      customProperties: {}
    });
    HeimdallrService.performanceTest(); 
  }]);
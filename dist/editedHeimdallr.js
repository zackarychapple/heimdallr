(function () {
  'use strict';
  var HeimdallrService = angular.module('HeimdallrService', []);

  HeimdallrService.service('HeimdallrService', ['$http', '$rootScope', '$interval', '$log', function ($http, $rootScope, $interval, $log) {
    var heiSvc = this;
    
    /**
     * Default object for sending performance data.
     * @type {{angularVersion: {major: number}, watcherCount: (number|*|b), guid: null, navigation: *, resources: *, marks: *, measures: *}}
     */
    heiSvc.rum = {
      angularVersion: angular.version,
      userAgent: navigator.userAgent,
      watcherCount: $rootScope.$$watchersCount
    };
    

  }]);

  HeimdallrService.provider('Heimdallr', ['$provide', '$httpProvider', function ($provide, $httpProvider) {
    var Heimdallr = {};

    Heimdallr.bindHttp = function () {
      setupHttpInterceptor();
    };

    var setupHttpInterceptor = function () {
      $provide.factory('httpInterceptor', ['$q', function ($q) {
        return {
          'request': function (config) {
            performance.mark('Start:' + config.url);
            return config || $q.when(config);
          },
          'response': function (response) {
            try {
              performance.mark('End:' + response.config.url);
              performance.measure(response.config.url, 'Start:' + response.config.url, 'End:' + response.config.url);
            } catch (error) {
              //TODO: Currently URL's with `?` and `.` are unable to be caputured since the performance mark function does not like those characters.
            }
            performance.clearMarks('Start:' + response.config.url);
            performance.clearMarks('End:' + response.config.url);
            return response || $q.when(response);
          },
          'requestError': function (rejection) {
            try {
              performance.measure('RESPONSE ERROR: ' + rejection.config.url, 'Start:' + rejection.config.url, 'End:' + rejection.config.url);
            } catch (error) {

            }
            performance.clearMarks('Start:' + rejection.config.url);
            performance.clearMarks('End:' + rejection.config.url);
            return $q.reject(rejection);
          },
          'responseError': function (rejection) {
            try {
              performance.measure('RESPONSE ERROR: ' + rejection.config.url, 'Start:' + rejection.config.url, 'End:' + rejection.config.url);
            } catch (error) {

            }
            performance.clearMarks('Start:' + rejection.config.url);
            performance.clearMarks('End:' + rejection.config.url);
            return $q.reject(rejection);
          }
        };
      }]);
      $httpProvider.interceptors.push('httpInterceptor');
    };
    return {
      $get: function () {
        return Heimdallr;
      }
    }
  }]);
})();

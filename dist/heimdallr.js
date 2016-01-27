(function () {
  'use strict';
  var HeimdallrService = angular.module('HeimdallrService', []);

  HeimdallrService.service('HeimdallrService', ['$http', '$rootScope', '$interval', '$log', function ($http, $rootScope, $interval, $log) {
    var errorMsg = {
      measureMissing: "HeimdallrSvc: One of the measure marks is missing: ",
      noUiRouter: "HeimdallrSvc: ui.router not in use",
      duplicateRum: 'HeimdallrSvc: Property not added, duplicate key exists on rum object',
      urlMissing: 'HeimdallrSvc: URL not specified stats will not be sent'
    };

    var heiSvc = this;
    /**
     * Function for generating UUID from http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
     * @returns {string}
     */
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    heiSvc.append = function (attr, value) {
      heiSvc.rum.customProperties[attr] = value;
    };

    /**
     * Append and send function for adding attr/value before sending performance data
     * @attr {string} - used for adding attribute to rum object
     * @value {string} - value for attribute
     * @remove {boolean} - if enabled will remove attribute from rum object after stats sent
     */
    heiSvc.appendAndSend = function (attr, value, remove) {
      heiSvc.append(attr, value);
      var deleteAfterSend = function () {
        delete heiSvc.rum.customProperties[attr];
      };
      heiSvc.sendStats(remove ? deleteAfterSend : null);
    };

    /**
     * Send stats function, used for sending back. Requires url to be defined in config in order to send
     * @callback {function} - used as a callback after the send promise is returned
     */
    heiSvc.sendStats = function (callback) {
      if (angular.isDefined(heiSvc.url)) {
        heiSvc.updateRum();
        var sent = $http.post(heiSvc.url, heiSvc.rum, performance.clearMarks("Start:" + heiSvc.url));
        sent.then(callback).finally(function () {
          performance.clearMeasures();
          performance.clearResourceTimings();
        });
      }
    };

    /**
     * Default object for sending performance data.
     * @type {{angularVersion: {major: number}, watcherCount: (number|*|b), guid: null, navigation: *, resources: *, marks: *, measures: *}}
     */
    heiSvc.rum = {
      time: new Date(Date.now()),
      location: {
        href: window.location.href,
        hash: window.location.hash,
        hostname: window.location.hostname
      },
      angularVersion: angular.version,
      watcherCount: $rootScope.$$watchersCount,
      guid: null,
      customProperties: {},
      navigation: performance.timing,
      resources: performance.getEntriesByType('resource'),
      marks: performance.getEntriesByType('mark'),
      measures: performance.getEntriesByType('measure'),
      memory: {
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize
      }
    };
    heiSvc.interval = 10000; //default;
    heiSvc.routeEventArray = [];
    heiSvc.customEventArray = [];

    heiSvc.addEvent = function (name) {
      performance.mark(name);
      heiSvc.customEventArray.push(name);
    };

    heiSvc.updateRum = function () {
      heiSvc.rum.time = new Date(Date.now());
      heiSvc.watcherCount = $rootScope.$$watchersCount;
      heiSvc.navigation = performance.timing;
      heiSvc.resources = performance.getEntriesByType('resource');
      heiSvc.marks = performance.getEntriesByType('mark');
      heiSvc.measures = performance.getEntriesByType('measure');
      heiSvc.memory = {
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        usedJSHeapSize: performance.memory.usedJSHeapSize
      };
      if (heiSvc.routeEventArray.length > 0) {
        heiSvc.rum.routeEvents = heiSvc.routeEventArray
      }
    };
    heiSvc.measure = function (lable, startMark, endMark, remove) {
      try {
        performance.measure(lable, startMark, endMark);
        if (remove === true) {
          heiSvc.customEventArray
            .splice(heiSvc.customEventArray.indexOf(startMark, 1))
            .splice(heiSvc.customEventArray.indexOf(endMark, 1))
        }
      } catch (error) {
        $log.debug(errorMsg.measureMissing + error)
      }
    };

    heiSvc.performanceTest = function (testCount) {
      var testLength = 0;
      var resultSpeedTotal = 0;
      if (performance.getEntries().length > testCount) {
        testLength = testCount;
      } else {
        console.log('test count is less than entry count');
        testLength = performance.getEntries().length
      }
      for (var i = 0; i < testLength; i++) {
        var file = performance.getEntries()[i];
        var url = file.name;
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send(null);
        if (http.status === 200) {
          var fileSize = parseInt(http.getResponseHeader('content-length'));
          if (fileSize > 1024) {
            var kb = fileSize / 1024;
            resultSpeedTotal += ( (kb / 1024) / (file.duration / 1000 / 1000));
          }
        }
      }
      heiSvc.downloadSpeed = (resultSpeedTotal / testLength);
      heiSvc.downloadSpeedUnit = "mb/s";
    };

    /**
     * Initialization function requiring a configuration object to setup properties for the service
     * @config {object} configuration object for the init, requires URL
     */
    heiSvc.init = function (config) {
      /**
       *  config object for Heimdallr Service
       *  @guid {uuid | string} guid [generated UUID] - for user identification, generated if not provided
       *  @debug {boolean} debug - for enabling logging messages
       *  @interval {integer} interval [10000]- time in milliseconds between which stats are sent back
       *  @url {[string]url} url - required URL for the service
       */
      if (config.debug) {
        $log.debugEnabled(true)
      }
      if (angular.isDefined(config.guid)) {
        heiSvc.rum.guid = config.guid;
      } else {
        heiSvc.rum.guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
      }

      if (angular.isDefined(config.customProperties)) {
        var props = config.customProperties;
        for (var key in props) {
          if (props.hasOwnProperty(key)) {
            if (heiSvc.rum.hasOwnProperty(key)) {
              $log.debug(errorMsg.duplicateRum)
            } else {
              heiSvc.rum[key] = props[key]
            }
          }
        }
      }

      if (angular.isUndefined(config.url)) {
        $log.debug(errorMsg.urlMissing);
      } else {
        heiSvc.url = config.url;
      }
      if (angular.isDefined(config.interval)) {
        heiSvc.interval = config.interval;
      }
    };
    /**
     * Binding the events for routing
     */
    heiSvc.bindRoutingEvents = function () {
      /**
       * Checking for ui.router to bind specific events for routing
       */
      try {
        if (angular.isDefined(angular.module('ui.router'))) {
          $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            var now = new Date(Date.now()).getTime();
            heiSvc.routeEventArray.push({
              'event': now,
              'fromState': fromState,
              'fromParams': fromParams,
              'toState': toState,
              'toParams': toParams
            });
            performance.mark(now);
          });
          $rootScope.$on('$viewContentLoaded', function () {
            var now = new Date(Date.now()).getTime();
            performance.mark(now);
            if (heiSvc.routeEventArray.length > 1) {
              var toName = heiSvc.routeEventArray[heiSvc.routeEventArray.length - 1].toState.name;
              var fromName = heiSvc.routeEventArray[heiSvc.routeEventArray.length - 1].fromState.name;
              var eventStamp = heiSvc.routeEventArray[heiSvc.routeEventArray.length - 1].event;
              try {
                performance.measure("Successful change from: " + fromName + " to: " + toName, eventStamp, now);
              } catch (error) {
                $log.debug(errorMsg.measureMissing + error)
              }
              performance.clearMarks(eventStamp)
            }
            heiSvc.appendAndSend("currentView", toName)
          })
        }
      } catch (err) {
        $log.debug(errorMsg.noUiRouter)
      }
    };

    $interval(heiSvc.sendStats, heiSvc.interval);
  }]);

  HeimdallrService.provider('Heimdallr', ['$provide', '$httpProvider', function ($provide, $httpProvider) {
    var Heimdallr = {};

    Heimdallr.bindHttp = function () {
      setupHttpInterceptor();
    };

    var setupHttpInterceptor = function () {
      $provide.factory('httpInterceptor', function ($q) {
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
      });
      $httpProvider.interceptors.push('httpInterceptor');
    };
    return {
      $get: function () {
        return Heimdallr;
      }
    }
  }]);
})();

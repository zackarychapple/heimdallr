import {BrowserPerformance} from "./BrowserPerformance";
export class HeimdallrProvider {

  bindHttp() {
    this.setupHttpInterceptor();
  };

  setupHttpInterceptor() {
    $provide.factory('httpInterceptor', ['$q', function ($q) {
      let bp:BrowserPerformance = new BrowserPerformance();
      
      return {
        'request': function (config) {
          bp.mark('Start:' + config.url);
          return config || $q.when(config);
        },
        'response': function (response) {
          try {
            bp.mark('End:' + response.config.url);
            bp.measure(response.config.url, 'Start:' + response.config.url, 'End:' + response.config.url);
          } catch (error) {
            //TODO: Currently URL's with `?` and `.` are unable to be caputured since the performance mark function does not like those characters.
          }
          bp.clearMarks('Start:' + response.config.url);
          bp.clearMarks('End:' + response.config.url);
          return response || $q.when(response);
        },
        'requestError': function (rejection) {
          try {
            bp.measure('RESPONSE ERROR: ' + rejection.config.url, 'Start:' + rejection.config.url, 'End:' + rejection.config.url);
          } catch (error) {

          }
          bp.clearMarks('Start:' + rejection.config.url);
          bp.clearMarks('End:' + rejection.config.url);
          return $q.reject(rejection);
        },
        'responseError': function (rejection) {
          try {
            bp.measure('RESPONSE ERROR: ' + rejection.config.url, 'Start:' + rejection.config.url, 'End:' + rejection.config.url);
          } catch (error) {

          }
          bp.clearMarks('Start:' + rejection.config.url);
          bp.clearMarks('End:' + rejection.config.url);
          return $q.reject(rejection);
        }
      };
    }]);
    $httpProvider.interceptors.push('httpInterceptor');
  };

  $get() {
    return this
  }
}
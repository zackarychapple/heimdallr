import {Heimdallr} from "./Heimdallr";
import {HeimdallrProvider} from "./HeimdallrProvider";
let HeimdallrService = angular.module('HeimdallrService', []);

HeimdallrService.service('HeimdallrService', ['$rootScope', ($rootScope)=> {
  let heimdallr = new Heimdallr();
  let watcherCheck = function(){
    heimdallr.append('watcherCount', $rootScope.$$watchersCount);
    heimdallr.append('angularVersion', angular.version.full);
  };
  
  heimdallr.injectible([watcherCheck]);

  return heimdallr;
}]);

HeimdallrService.provider('Heimdallr', ['$provide', '$httpProvider', function ($provide, $httpProvider) {
  let heimdallr = new HeimdallrProvider($provide, $httpProvider);

  return {
    $get(){
      heimdallr
    }
  }
}]);
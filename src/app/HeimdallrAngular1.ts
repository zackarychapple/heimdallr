import {Heimdallr} from "./Heimdallr";
import {HeimdallrProvider} from "./HeimdallrProvider";
let HeimdallrService = angular.module('HeimdallrService', []);

HeimdallrService.service('HeimdallrService', ['$rootScope', ($rootScope)=> {
  Object.assign(this, new Heimdallr());

  let watcherCheck = function(){
    this.append('watcherCount', $rootScope.$$watchersCount);
    this.append('angularVersion', angular.version.full);
  };

  this.injectible([watcherCheck]);
}]);

HeimdallrService.provider('Heimdallr', ['$provide', '$httpProvider', function ($provide, $httpProvider) {
  let heimdallr = new HeimdallrProvider($provide, $httpProvider);

  return {
    $get(){
      return heimdallr
    }
  }
}]);
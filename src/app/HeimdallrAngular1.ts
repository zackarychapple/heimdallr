import {Heimdallr} from "./Heimdallr";
import {HeimdallrProvider} from "./HeimdallrProvider";
let HeimdallrService = angular.module('HeimdallrService', []);


export class CustomHeimdallr extends Heimdallr {
  constructor($rootScope:ng.IRootScopeService) {
    super($rootScope);
    let watcherPush = ()=> {
      this.rumData.watcherCount = this.$rootScope.$$watchersCount;
      this.rumData.angularVersion = angular.version.full;
    };
    this.customFunctions.push(watcherPush)
  }
}

CustomHeimdallr.$inject = ["$rootScope"];

HeimdallrService.service('HeimdallrService', CustomHeimdallr);

HeimdallrService.provider('Heimdallr', ['$provide', '$httpProvider', function ($provide, $httpProvider) {
  let heimdallr = new HeimdallrProvider($provide, $httpProvider);

  return {
    $get(){
      return heimdallr
    }
  }
}]);

export {
  Heimdallr,
  HeimdallrService,
  HeimdallrProvider
}
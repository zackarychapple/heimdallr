import {Heimdallr} from "./Heimdallr";
import {HeimdallrProvider} from "./HeimdallrProvider";
let HeimdallrService = angular.module('HeimdallrService', []);

HeimdallrService.service('HeimdallrService', Heimdallr);

export {
  Heimdallr,
  HeimdallrService
}

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
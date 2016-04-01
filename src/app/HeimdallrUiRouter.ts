import {HeimdallrErrors} from "./HeimdallrErrors";
import {RouteEvent} from "./RouteEvent";

export class HeimdallrUiRouter {
  routeEventArray:Array<RouteEvent> = [];
  sendEvent:Function;
  errorMsg:HeimdallrErrors;
  $rootScope:ng.IRootScopeService;

  bindRoutingEvents() {
    try {
      if (typeof angular.module('ui.router') !== 'undefined') {
        this.$rootScope.$on('$stateChangeStart', (event, toState, toParams, fromState, fromParams) => {
          let now = new Date(Date.now()).getTime().toString();
          this.routeEventArray.push({
            'event': now,
            'fromState': fromState,
            'fromParams': fromParams,
            'toState': toState,
            'toParams': toParams
          });
          performance.mark(now);
        });
        this.$rootScope.$on('$viewContentLoaded', ()=> {
          let now = new Date(Date.now()).getTime().toString();
          performance.mark(now);
          if (this.routeEventArray.length > 1) {
            var toName = this.routeEventArray[this.routeEventArray.length - 1].toState.name;
            var fromName = this.routeEventArray[this.routeEventArray.length - 1].fromState.name;
            var eventStamp = this.routeEventArray[this.routeEventArray.length - 1].event;
            try {
              performance.measure("Successful change from: " + fromName + " to: " + toName, eventStamp, now);
            } catch (error) {
              console.log(this.errorMsg.measureMissing + error)
            }
            performance.clearMarks(eventStamp)
          }
          this.sendEvent("currentView", toName)
        })
      }
    } catch (error) {
      console.log(error)
    }
  }

  constructor(routeEventArray:Array<RouteEvent>, sendEvent:Function, messages:HeimdallrErrors, $rootScope:ng.IRootScopeService) {
    this.errorMsg = messages;
    this.routeEventArray = routeEventArray;
    this.sendEvent = sendEvent;
    this.$rootScope = $rootScope;
    this.bindRoutingEvents();
  }
}
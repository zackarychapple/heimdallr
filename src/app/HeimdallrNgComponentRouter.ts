import {HeimdallrErrors} from "./HeimdallrErrors";
import {ComponentRouteEvent} from "./RouteEvent";

export class HeimdallrNgComponentRouter {
  routeEventArray:Array<ComponentRouteEvent> = [];
  sendEvent:Function;
  errorMsg:HeimdallrErrors;
  $rootScope:ng.IRootScopeService;

  bindRoutingEvents() {
    try {
      if (typeof angular.module('ngComponentRouter') !== 'undefined') {
        this.$rootScope.$on('$routerOnActivate', (event, data) => {
          let now = new Date(Date.now()).getTime().toString();
          let eventObj = {
            'eventTime': now,
            'event':event,
            'next': data.next,
          };
          if (data.previous){
            eventObj['prev'] = data.previous
          }
          this.routeEventArray.push(eventObj);
          performance.mark(now);
        });
        this.$rootScope.$on('$viewContentLoaded', ()=> {
          let now = new Date(Date.now()).getTime().toString();
          performance.mark(now);
          if (this.routeEventArray.length > 1) {

            var toName = this.routeEventArray[this.routeEventArray.length - 1].next.name;
            var fromName = this.routeEventArray[this.routeEventArray.length - 1].prev.name;
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

  constructor(routeEventArray:Array<ComponentRouteEvent>, sendEvent:Function, messages:HeimdallrErrors, $rootScope:ng.IRootScopeService) {
    this.errorMsg = messages;
    this.routeEventArray = routeEventArray;
    this.sendEvent = sendEvent;
    this.$rootScope = $rootScope;
    this.bindRoutingEvents();
  }
}

//promise.then(scope.$root.$emit('routerOnActivate', {"current":outlet.currentInstruction, "previous":outlet.previousInstruction}));
//Goes in angular_1_router.js in routerTriggerDirective
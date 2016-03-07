import {Guid} from './Guid';
import {RouteEvent} from "./RouteEvent";

export class PerformanceObject {
  angularVersion:string = '';
  customProperties:Object = {};
  downloadSpeed:number = 0;
  downloadSpeedUnit:string = 'mb/s';
  guid:Guid = new Guid();
  location:Object = {};
  marks:Array<Object> = [];
  measures:Array<Object> = [];
  memory:Object = {};
  navigation:Object = {};
  resources:Array<Object> = [];
  routeEvents:Array<RouteEvent> = [];
  time:Date;
  userAgent:string = '';
  watcherCount:number = 0;

  constructor() {
    this.time = new Date(Date.now());
    return this;
  }
}

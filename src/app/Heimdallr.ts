import {PerformanceObject} from "./PerformanceObject";
import {BrowserPerformance} from "./BrowserPerformance";
import {HeimdallrHttp} from "./HeimdallrHttp";
import {HeimdallrErrors} from "./HeimdallrErrors";
import {HeimdallrUiRouter, HeimdallrRouterBase} from "./HeimdallrUiRouter";
import {Guid} from './Guid';

export class ConfigObj {
  guid:Guid;
  customProperties:Object;
  router:string = '';
  url:string = '';
  intervalTime:number;
}

export class Heimdallr {
  bp:BrowserPerformance = new BrowserPerformance();
  customEventArray:Array<string> = [];
  customFunctions:Array<Function> = [];
  msg:HeimdallrErrors = new HeimdallrErrors();
  http:HeimdallrHttp = new HeimdallrHttp();
  intervalTime:number = 10000;
  rumData:PerformanceObject = new PerformanceObject();
  routeEventsArray:Array<String> = [];
  url:string = '';
  router:HeimdallrRouterBase;

  addEvent(name:string) {
    this.bp.mark(name);
    this.customEventArray.push(name);
  }

  append(attr:string, value:string) {
    this.rumData.customProperties[attr] = value;
  }

  appendAndSend(attr:string, value:string, remove?:boolean) {
    this.append(attr, value);
    let deleteAfterSend = ()=> {
      delete this.rumData.customProperties[attr];
    };
    if (this.url !== '') {
      this.sendStats(remove ? deleteAfterSend : null);
    }
  }

  injectible(funcs:[Function]) {
    this.customFunctions.push(...funcs)
  }

  interval() {
    setInterval(()=> {
      this.sendStats();
    }, this.intervalTime);
  }

  init(config:ConfigObj) {
    this.url = config.url;
    if (config.router == 'ui-router') {
      this.router = new HeimdallrUiRouter(this.routeEventsArray, this.appendAndSend, this.msg);
    }
    if (config.intervalTime) {
      this.intervalTime = config.intervalTime;
    }
    if (config.guid) {
      this.rumData.guid = config.guid;
    }
    if (config.customProperties) {
      let props = config.customProperties;
      for (var key in props) {
        if (props.hasOwnProperty(key)) {
          if (!this.rumData.customProperties.hasOwnProperty(key)) {
            this.rumData.customProperties[key] = props[key]
          }
        }
      }
    }
    this.interval();
  }

  measure(lable:string, startMark:string, endMark:string, remove:boolean) {
    try {
      this.bp.measure(lable, startMark, endMark);
      if (remove) {
        this.customEventArray
          .splice(this.customEventArray.indexOf(startMark), 1)
          .splice(this.customEventArray.indexOf(endMark), 1);
      }
    } catch (error) {
      console.log(this.msg.measureMissing)
    }
  }

  performanceTest(testCount:number) {
    let resultSpeedTotal:number = 0;
    let host:string = window.location.host;
    let protocol:string = window.location.protocol;
    let entries:Array<Object> = this.bp.getEntries();
    let speedTotal:number = 0;

    if (entries.length > testCount) {
      entries = entries.slice(0, testCount);
    }
    entries.forEach(entry => {
      let url = entry.name;
      let urlParser = document.createElement('a');
      urlParser.href = url;
      if (urlParser.host === host && urlParser.protocol === protocol) {
        let fileSize = this.http.getSize(url);
        speedTotal += (fileSize / 1024 / 1024) / (entry.duration / 1000 / 1000)
      }
    });
    this.rumData.downloadSpeed = Math.round((resultSpeedTotal / entries.length));
  }

  sendStats(callback?) {
    if (this.url !== '') {
      this.updateRum();
      this.http.post(this.url, this.rumData, callback);
      // Need to cleanup myself
      // performance.clearMarks("Start:" + heiSvc.url))
      this.bp.clearMeasures();
      this.bp.clearResourceTimings();
    }
  }

  updateRum() {
    this.customFunctions.forEach((func)=> {
      func();
    });
    this.rumData.time = new Date(Date.now());
    this.rumData.location = {
      href: window.location.href,
      hash: window.location.hash,
      hostname: window.location.hostname
    };
    // TODO: Find a way to call custom functions to populate things like watcher count
    // watcherCount: $rootScope.$$watchersCount,
    this.rumData.navigation = this.bp.timing();
    this.rumData.resources = this.bp.getEntriesByType('resource');
    this.rumData.marks = this.bp.getEntriesByType('mark');
    this.rumData.measures = this.bp.getEntriesByType('measure');
    this.rumData.memory = {
      jsHeapSizeLimit: this.bp.memory().jsHeapSizeLimit,
      totalJSHeapSize: this.bp.memory().totalJSHeapSize,
      usedJSHeapSize: this.bp.memory().usedJSHeapSize
    };
    if (this.routeEventsArray.length > 0) {
      this.rumData.routeEvents = this.routeEventsArray;
    }
    this.rumData.userAgent = navigator.userAgent;
  }
}

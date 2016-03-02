export class BrowserPerformance {
  clearMeasures(measureName?:string):void {
    if (typeof performance.clearMeasures === 'function') {
      return performance.clearMeasures(measureName)
    }
  }

  clearMarks(name?:string):void {
    if (typeof performance.clearMarks === 'function') {
      return performance.clearMarks(name)
    }
  }

  clearResourceTimings():void {
    if (typeof performance.clearResourceTimings == 'function') {
      return performance.clearResourceTimings();
    }
  }

  getEntries():Array<Object> {
    if (typeof performance.getEntries == 'function') {
      return performance.getEntries();
    }
  }

  getEntriesByType(type?:string):Array<Object> {
    if (typeof performance.getEntriesByType == 'function') {
      return performance.getEntriesByType(type);
    }
  }

  mark(name?:string) {
    if (typeof performance.mark == 'function') {
      return performance.mark(name);
    }
  }

  measure(lable:string, startMark:string, endMark:string) {
    if (typeof performance.measure == 'function') {
      return performance.measure(lable, startMark, endMark)
    }
  }

  memory():Object {
    if (typeof performance.memory !== 'undefined') {
      return performance.memory;
    } else {
      return {
        jsHeapSizeLimit: 0,
        totalJSHeapSize: 0,
        usedJSHeapSize: 0
      }
    }
  }

  timing():Object {
    if (typeof performance.timing !== 'undefined') {
      return performance.timing;
    }
  }
}

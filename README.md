#[Heimdallr](https://github.com/zackarychapple/heimdallr)
[![MIT license](http://img.shields.io/badge/license-MIT-brightgreen.svg)](http://opensource.org/licenses/MIT)

Performance monitoring for Angular applications.  
By default Heimdallr tracks useful information and submits data every 10s:
* Angular app information (Version number and such)
* WatcherCount 
* ui.router state changes
* Custom events

## Compatibility ##
* Angular 1.4+ (tested on 1.4.7 & 1.4.8)
* Routers: ui.router

## Setup ##
Add Module to your application.
```javascript
var myApp = angular.module('yourApp',['HeimdallrService']);
```

Heimdallr needs to hook into http requests in order to provide accurate timings for http requests.  
```javascript
myApp.config(['HeimdallrProvider', function(HeimdallrProvider){
  HeimdallrProvider.$get().bindHttp();
}]);
```

Starting the Heimdallr service requires that you put in a URL as the destination for your performance metrics.  Any number of custom attributes can be set on the `customProperties` object. 
```javascript
myApp.run(['HeimdallrService', function(HeimdallrService){
    HeimdallrService.init({
          url: '/monitoring/perf',
          customProperties: {
            app: appConstant
          }
        });
    HeimdallrService.bindRoutingEvents(); // Binds routing events for ui.router
    HeimdallrService.performanceTest(); // Does performance test to establish bandwidth 
}]);
```

Custom events are easily added.   
```javascript
beginningFunction = function(){
  HeimdallrService.addEvent('event1');
}
```

Add a second event.
```javascript
endFunction = function(){
  HeimdallrService.addEvent('event2');
}
```

Calculate the measurement: (title, start, end, remove after submit).  After measurement is calculated data will be submitted immediately. 
```javascript
  HeimdallrService.measure("SomeTitle", 'event1', 'event2', true);
```

## Troubleshooting ##
Enabling debug will enable console error messages. 
```javascript
myApp.run(['HeimdallrService', function(HeimdallrService){
    HeimdallrService.init({
          debug: true,
          url: '/monitoring/perf',
          customProperties: {
            app: appConstant
          }
        });
}]);
```

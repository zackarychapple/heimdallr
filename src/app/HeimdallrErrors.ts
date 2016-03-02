export class HeimdallrErrors {
  measureMissing:string = "HeimdallrSvc: One of the measure marks is missing: ";
  noUiRouter:string = "HeimdallrSvc: ui.router not in use";
  duplicateRum:string = 'HeimdallrSvc: Property not added, duplicate key exists on rum object';
  urlMissing:string = 'HeimdallrSvc: URL not specified stats will not be sent';
  testCount:string = 'test count is less than entry count';
}

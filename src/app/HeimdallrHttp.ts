export class HeimdallrHttp {
  post(url:string, data:Object, callback?:Function) {
    let xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.send(data);
    if (callback) {
      callback();
    }
  }

  getSize(url:string) {
    let xhr = new XMLHttpRequest();
    xhr.open('HEAD', url, false);
    xhr.send(null);
    if (xhr.status === 200) {
      return parseInt(xhr.getResponseHeader('content-length'));
    }
  }
}

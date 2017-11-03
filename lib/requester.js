const _request = require('request');

const cookieJar = _request.jar();
const request = _request.defaults({ jar: cookieJar, strictSSL: false });

const Headers = require('../custom_modules/headers');


class Requester {
  constructor() {
    this.headers = new Headers();

    this.postJsonRequest = this.postJsonRequest.bind(this);
    this.postRequest = this.postRequest.bind(this);
    this.getRequest = this.getRequest.bind(this);
  }
  postRequest(endpoint, data, callback) {
    console.log(`sending POST request to ${endpoint}`);
    request({
      method: 'POST',
      url: endpoint,
      form: data,
      headers: this.headers.getHeaders(),
      json: true,
    },
    callback);
  }

  postJsonRequest(endpoint, data, callback) {
    console.log(`sending JSON request to ${endpoint}`);

    request({
      method: 'POST',
      url: endpoint,
      body: data,
      headers: this.headers.getHeaders(),
      json: true,
    },
    callback);
  }

  getRequest(endpoint, callback) {
    console.log(`sending GET request to ${endpoint}`);

    request({
      method: 'GET',
      url: endpoint,
      headers: this.headers.getHeaders(),
      json: true,
    },
    callback);
  }
}

module.exports = Requester;

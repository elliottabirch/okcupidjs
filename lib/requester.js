const _request = require('request');
const headers = require('../custom_modules/headers');

const cookieJar = _request.jar();
const request = _request.defaults({ jar: cookieJar, strictSSL: false });


class Requester {
  postRequest = (endpoint, data, callback) => {
    request({
      method: 'POST',
      url: endpoint,
      form: data,
      headers: headers.getHeaders(),
      json: true,
    },
    callback);
  };

  postJsonRequest = (endpoint, data, callback) => {
    request({
      method: 'POST',
      url: endpoint,
      body: data,
      headers: headers.getHeaders(),
      json: true,
    },
    callback);
  };

  getRequest = (endpoint, callback) => {
    request({
      method: 'GET',
      url: endpoint,
      headers: headers.getHeaders(),
      json: true,
    },
    callback);
  };
}
module.exports = Requester;

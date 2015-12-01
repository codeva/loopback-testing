var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = require('assert');
var path = require('path');

chai.use(chaiHttp);
var expect = chai.expect;

var success = {
  from: 100,
  to: 399
};

module.exports.Resource = function(app, baseUrl){
  this.app = app;
  this.baseUrl = baseUrl;

  this.accessShouldBeDenied = function(requestData, done) {
    var _this = this;
    this.readAccessShouldBeDenied(requestData, function(){
      _this.writeAccessShouldBeDenied(requestData, done);
    });
  };

  this.accessShouldBeAllowed = function(requestData, done) {
    var _this = this;
    this.readAccessShouldBeAllowed(requestData, function(){
      _this.writeAccessShouldBeAllowed(requestData, done);
    });
  };

  this.readAccessShouldBeDenied = function(requestData, done) {
    this.readAccessShouldReturnStatus(401, requestData, done);
  };

  this.writeAccessShouldBeDenied = function(requestData, done) {
    this.writeAccessShouldReturnStatus(401, requestData, done);
  };

  this.readAccessShouldBeAllowed = function(requestData, done) {
    this.readAccessShouldReturnStatus(success, requestData, done);
  };

  this.writeAccessShouldBeAllowed = function(requestData, done) {
    this.writeAccessShouldReturnStatus(success, requestData, done);
  };

  this.readAccessShouldReturnStatus = function(expectedStatus, requestData, done) {
    var _this = this;
    this.expectStatus('GET', this.baseUrl, requestData, expectedStatus, function(){
      _this.expectStatus('GET', path.join(_this.baseUrl, 'count'), requestData, expectedStatus, function(){
        _this.expectStatus('GET', path.join(_this.baseUrl, 'findOne'), requestData, expectedStatus, done);
      });
    });
  };

  this.writeAccessShouldReturnStatus = function(expectedStatus, requestData, done) {
    var _this = this;
    this.expectStatus('POST', _this.baseUrl, requestData, expectedStatus, function(err, res){
      if (res.body && res.body.id) {
        var optionsPassword = requestData.entity.password;
        requestData.entity = res.body;
        requestData.entity.password = optionsPassword;
      }
      _this.expectStatus('PUT', _this.baseUrl, requestData, expectedStatus, function(err, res){
        if (requestData.instance){
          _this.writeAccessToInstanceShouldReturnStatus(expectedStatus, requestData, done);
        }
        else {
          done();
        }
      });
    });
  };

  this.writeAccessToInstanceShouldReturnStatus = function(expectedStatus, requestData, done) {
    var _this = this;
    requestData.entity = requestData.instance;
    var urlWithId = path.join(_this.baseUrl, requestData.instance.id.toString());
    _this.expectStatus('PUT', urlWithId, requestData, expectedStatus, function () {
      _this.expectStatus('DELETE', urlWithId, requestData, expectedStatus, done);
    });
  };

  this.expectStatus = function(method, url, requestData, status, done) {
    var request = this.buildRequest(method, url);
    var requestEntity;
    var responseCallback = function(err, res){
      expect(err).to.be.null;
      if (status.from){
        var message = method + ' ' + url;
        if (res.body.error) {
          message += ' Message: ' + res.body.error.message;
        }
        if (requestEntity) {
          message += ' Entity: ' + JSON.stringify(requestEntity);
        }
        expect(res.status, message).to.be.within(status.from, status.to);
      }
      else {
        expect(res, method + ' ' + url).to.have.status(status);
      }
      done(err, res);
    };
    if (method === 'POST' || method === 'PUT') {
      requestEntity = requestData.entity;
      //requestEntity.id = 50;
      if (method === 'POST' && requestData.entity) {
        requestEntity = requestData.entity;
      }
      request = request.send(requestEntity);
    }
    request.end(responseCallback);
  };

  this.buildRequest = function(method, url){
    var request;
    if (method === 'GET'){
      request = this.app.request.get(url);
    }
    if (method === 'POST'){
      request = this.app.request.post(url);
    }
    if (method === 'PUT'){
      request = this.app.request.put(url);
    }
    if (method === 'DELETE'){
      request = this.app.request.delete(url);
    }
    assert(request);
    request = this.app.auth.setAuthHeader(request);
    return request;
  }

};

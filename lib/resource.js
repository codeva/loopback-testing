var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = require('assert');
var path = require('path');

chai.use(chaiHttp);
var expect = chai.expect;

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
    this.readAccessShouldReturnStatus(200, requestData, done);
  };

  this.writeAccessShouldBeAllowed = function(requestData, done) {
    this.writeAccessShouldReturnStatus(200, requestData, done);
  };

  this.readAccessShouldReturnStatus = function(expectedStatus, requestData, done) {
    var _this = this;
    this.expectStatus('GET', this.baseUrl, expectedStatus, function(){
      _this.expectStatus('GET', path.join(_this.baseUrl, 'count'), expectedStatus, function(){
        _this.expectStatus('GET', path.join(_this.baseUrl, 'findOne'), expectedStatus, done);
      });
    });
  };

  this.writeAccessShouldReturnStatus = function(expectedStatus, requestData, done) {
    var _this = this;
    this.expectStatus('POST', _this.baseUrl, expectedStatus, function(){
      _this.expectStatus('PUT', _this.baseUrl, expectedStatus, function(){
        if (requestData.instance){
          _this.writeAccessToInstanceShouldReturnStatus(401, requestData, done);
        }
        else {
          done();
        }
      });
    });
  };

  this.writeAccessToInstanceShouldReturnStatus = function(expectedStatus, requestData, done) {
    var _this = this;
    var urlWithId = path.join(_this.baseUrl, requestData.instance.id.toString());
    _this.expectStatus('PUT', urlWithId, expectedStatus, function () {
      _this.expectStatus('DELETE', urlWithId, expectedStatus, done);
    });
  };

  this.expectStatus = function(method, url, status, done) {
    var request = this.buildRequest(method, url);
    request.end(function(err, res){
      expect(err).to.be.null;
      expect(res, method + ' ' + url).to.have.status(status);
      done(err);
    })
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

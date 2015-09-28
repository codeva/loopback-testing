var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = require('assert');
var path = require('path');

chai.use(chaiHttp);
var expect = chai.expect;

module.exports.Resource = function(app, baseUrl){
  this.app = app;
  this.baseUrl = baseUrl;

  this.accessShouldBeDenied = function(resourceId, done) {
    var _this = this;
    this.readAccessShouldBeDenied(resourceId, function(){
      _this.writeAccessShouldBeDenied(resourceId, done);
    })
  };

  this.readAccessShouldBeDenied = function(resourceId, done) {
    this.expectStatus('GET', this.baseUrl, 401, done);
  };

  this.writeAccessShouldBeDenied = function(resourceId, done) {
    var _this = this;
    this.expectStatus('POST', _this.baseUrl, 401, function(){
      _this.expectStatus('PUT', _this.baseUrl, 401, function(){
        if (resourceId){
          var urlWithId = path.join(_this.baseUrl, resourceId.toString());
          _this.expectStatus('PUT', urlWithId, 401, function () {
            _this.expectStatus('DELETE', urlWithId, 401, done);
          });
        };
      });
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
    return request;
  }

};
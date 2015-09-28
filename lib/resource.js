var chai = require('chai');
var chaiHttp = require('chai-http');
var assert = require('assert');

chai.use(chaiHttp);
var expect = chai.expect;

module.exports.Resource = function(app, baseUrl){
  this.app = app;
  this.baseUrl = baseUrl;

  this.accessShouldBeDenied = function(done) {
    var _this = this;
    this.readAccessShouldBeDenied(function(){
      _this.writeAccessShouldBeDenied(done);
    })
  };

  this.readAccessShouldBeDenied = function(done) {
    this.expectStatus('GET', this.baseUrl, 401, done);
  };

  this.writeAccessShouldBeDenied = function(done) {
    this.expectStatus('POST', this.baseUrl, 401, done);
  };

  this.expectStatus = function(method, url, status, done) {
    var request = this.buildRequest(method, url);
    request.end(function(err, res){
      expect(err).to.be.null;
      expect(res).to.have.status(status);
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
    assert(request);
    return request;
  }

};
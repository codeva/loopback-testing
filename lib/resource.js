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
    var expectedStatus = 401;
    var request = this.buildRequest('GET', this.baseUrl);
    request.end(function(err, res){
      expect(err).to.be.null;
      expect(res).to.have.status(expectedStatus);
      done(err);
    })
  };

  this.writeAccessShouldBeDenied = function(done) {
    done();
  };

  this.buildRequest = function(method, url){
    var request;
    if (method === 'GET'){
      request = this.app.request.get(url);
    }
    assert(request);
    return request;
  }

};
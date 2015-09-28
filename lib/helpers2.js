var assert = require('assert');
var supertest = require('supertest');
var expect = require('chai').expect;
var path = require('path');
var Datasources = require('./datasources').Datasources
var Resource = require('./resource').Resource

module.exports.TestApp = function(app) {
  this.app = app;
  this.request = supertest(app);
  this.datasources = new Datasources(this.app);
  this.it = new IT(this);
  this.restApiRoot = '/api';
  //this.post = this.request.post;
  //this.get = this.request.get;
  //this.put = this.request.put;
  //this.del = this.request.del;

  this.createResource = function(url){
    return new Resource(this, path.join(this.restApiRoot, url));
  };

  this.cleanUp = function(done) {
    this.datasources.cleanUp(done);
  };

}

module.exports.Resource = Resource;

var IT = function(helper){
  this.helper = helper;
  this.shouldBeDeniedWhenCalledAnonymously = function(verb, url, done) {
    done();
  }
}
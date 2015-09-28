var supertest = require('supertest');
var path = require('path');
var Datasources = require('./datasources').Datasources
var Resource = require('./resource').Resource

module.exports.TestApp = function(app) {
  this.app = app;
  this.request = supertest(app);
  this.datasources = new Datasources(this.app);
  this.restApiRoot = '/api';

  this.createResource = function(url){
    return new Resource(this, path.join(this.restApiRoot, url));
  };

  this.cleanUp = function(done) {
    this.datasources.cleanUp(done);
  };

}

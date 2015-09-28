var supertest = require('supertest');
var path = require('path');
var Datasources = require('./datasources').Datasources;
var Resource = require('./resource').Resource;
var Auth = require('./auth').Auth;

module.exports.TestApp = function(app) {
  this.app = app;
  this.request = supertest(app);
  this.datasources = new Datasources(this.app);
  this.auth = new Auth(this);
  this.restApiRoot = '/api';

  this.createResource = function(url){
    return new Resource(this, path.join(this.restApiRoot, url));
  };

  this.cleanUp = function(done) {
    var _this = this;
    this.auth.logout(function(err){
      if (err){
        done(err);
      }
      _this.datasources.cleanUp(done);
    });
  };

}

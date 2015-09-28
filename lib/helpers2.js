var assert = require('assert');
var supertest = require('supertest');
var expect = require('chai').expect;
var async = require('async');

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

  this.cleanUp = function(done) {
    this.datasources.cleanUp(done);
  };

}

var Datasources = function(app) {
  this.app = app;
  this.userModel = 'user';
  this.dsName = 'db';
  this.modelCleanupArr = [];

  this.createUser = function(user, done) {
    this.createRecord(this.userModel, user, done);
  };

  this.createRecord = function(modelId, attrs, done) {
    var model = this.app.models[modelId];
    assert(model, 'cannot get model of name ' + modelId + ' from app.models');
    assert(model.dataSource, 'cannot test model '+ modelId
      + ' without attached dataSource');
    assert(
      typeof model.create === 'function',
      modelId + ' does not have a create method'
    );

    var cleanupArr = this.modelCleanupArr;

    model.create(attrs, function(err, result) {
      if(err) {
        console.error(err.message);
        if(err.details) console.error(err.details);
        done(err);
      }
      else {
        var destroyModelFunc = model.destroyById.bind(model, result.id);
        cleanupArr.push(destroyModelFunc);
        done();
        return result;
      }
    });
  };

  this.cleanUp = function(done) {
    async.eachSeries(
      this.modelCleanupArr,
      function(cleanUpModelFunc, cb){
        cleanUpModelFunc(cb);
      },
      function(err){
        done(err)
      }
    )
  };

};

var IT = function(helper){
  this.helper = helper;
  this.shouldBeDeniedWhenCalledAnonymously = function(verb, url, done) {
    done();
  }
}
var async = require('async');
var assert = require('assert');

module.exports.Datasources = function(app) {
  this.app = app;
  this.userModel = 'user';
  this.dsName = 'db';
  this.modelCleanupArr = [];

  this.createUser = function(user, cb) {
    this.createRecord(this.userModel, user, cb);
  };

  this.createRecord = function(modelId, attrs, cb) {
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
        cb(err, result);
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
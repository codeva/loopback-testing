var async = require('async');
var assert = require('assert');

module.exports.Datasources = function(app) {
  this.app = app;
  this.dsName = 'db';
  this.modelCleanupArr = [];
  this.userModel = this.app.models['User'];

  this.setUserModel = function(modelKey) {
    this.userModel = this.app.models[modelKey];
  };

  this.createUser = function(user, cb) {
    this.createRecordForModel(this.userModel, user, cb);
  };

  this.assignRole = function(user, role, done) {
    var Role = this.app.models.Role;
    var RoleMapping = this.app.models.RoleMapping;
    Role.findOrCreate({name: role}, function(err, role) {
      if (err){
        return done(err);
      }

      role.principals.create({
          principalType: RoleMapping.USER,
          principalId: user.id
        },
        function(err, principal) {
          done(err);
        });
    });
  }

  this.createRecord = function(modelID, attrs, cb) {
    var model = this.app.models[modelID];
    this.createRecordForModel(model, attrs, cb);
  }

  this.createRecordForModel = function(model, attrs, cb) {
    var cleanupArr = this.modelCleanupArr;
    model.create(attrs, function(err, result) {
      if(err) {
        console.error(err.message);
        if(err.details){
          console.error(err.details);
        }
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
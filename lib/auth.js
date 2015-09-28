module.exports.Auth = function(testApp) {
  this.testApp = testApp;

  this.login = function(credentials, done) {
    var _this = this;
    this.testApp.datasources.userModel.login(credentials, function(err, token) {
      if(err) {
        done(err);
      }
      else {
        _this.loggedInAccessToken = token;
        done();
      }
    });
  };

  this.logout = function(done) {
    if (this.loggedInAccessToken){
      var _this = this;
      this.loggedInAccessToken.destroy(function(err) {
        if(err) {
          return done(err);
        }
        _this.loggedInAccessToken = undefined;
        done();
      });
    }
    else {
      done();
    }
  };

  this.setAuthHeader = function(request) {
    if (this.loggedInAccessToken){
      return request.set('Authorization', this.loggedInAccessToken.id);
    }
    return request;
  };

}
var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: true,

  links: function() {
    return this.hasMany(Link);
  },
  initialize: function(){
    this.on('creating', function(model, attrs, options){
      // var shasum = crypto.createHash('sha1');
      // shasum.update(model.get('url'));
      // model.set('code', shasum.digest('hex').slice(0, 5));

      var hash = bcrypt.hashSync(model.get('password'));
      model.set('password', hash);

      // bcrypt.hash(model.get('password'), null, null, function(err, hash) {
      //   model.set('password', hash);
      //   // model.save();
      // });
    });
  }
});

module.exports = User;
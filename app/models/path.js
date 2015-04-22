var db = require('../config');

var Path = db.Model.extend({
  tableName: 'urls',
  hasTimestamps: true,
  defaults: {
    visits: 0
  },
});

module.exports = Path;

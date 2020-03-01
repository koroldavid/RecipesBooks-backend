const recipesRoutes = require('./recipes_routes');

module.exports = function(app, db) {
  recipesRoutes(app, db);
};
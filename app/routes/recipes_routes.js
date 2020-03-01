const ObjectID = require('mongodb').ObjectID;
const rules    = require('../rules/recipes_rules');

module.exports = function(app, db) {
  app.get('/recipes', (req, res) => {
      db.collection('recipes').find().toArray((error, recipes) => {
        if (error) res.send(JSON.stringify({status: 500, massage: error}));
        
        const actualRecipes = recipes.filter(recipe => {
          return recipe.versionsId;
        });

        const sortedRecipes = actualRecipes.sort((a, b) => {
          if (a.dateCreated < b.dateCreated) return 1;
          if (a.dateCreated > b.dateCreated) return -1;

          return 0
        });

        const { limit, offset} = req.query;
        const from = offset;
        const to = +offset + +limit;

        const responce = {
          data  : sortedRecipes.slice(from, to),
          total : actualRecipes.length
        }

        res.send(responce);
      });
    });

  app.get('/recipes/:id', (req, res) => {
      const id = req.params.id;
      const details = { '_id': new ObjectID(id) };

      db.collection('recipes').findOne(details, (error, recipe) => {
        if (error) res.send(JSON.stringify({status: 500, massage: error}));

        const fittedIds = recipe.versionsId.map(id => {
          return new ObjectID(id);
        });

        const historyDetails = { '_id': { '$in' : [new ObjectID(id) ,...fittedIds]} };

        db.collection('recipes').find(historyDetails).toArray((error, recipeHistory) => {
          if (error) res.send(JSON.stringify({status: 500, massage: error}));

          const sortedHistory = recipeHistory.sort((a, b) => {
            if (a.dateCreated < b.dateCreated) return 1;
            if (a.dateCreated > b.dateCreated) return -1;
  
            return 0
          });

          res.send(sortedHistory);
        });
      });
    });

  app.post('/recipes', (req, res) => {
    const validData = rules.create.validate(req.body);

    if (validData) {
      const { title, description, guide, ingredients } = req.body;
      const recipe = {
        title,
        description,
        guide,
        ingredients,
        dateCreated : new Date(),
        version     : 1,
        versionsId  : []
      };

      db.collection('recipes').insertOne(recipe, (error, result) => {
        if (error) res.send(JSON.stringify({status: 500, massage: error}));

        res.send(result.ops[0]);
      });
    } else res.send(JSON.stringify({status: 'error', type : 'validation', fields: rules.create.getErrors()}));
  });

  app.put ('/recipes/:id', (req, res) => {
    const validData = rules.update.validate(req.body);

    if (validData) {
      const { title, description, guide, ingredients } = req.body;

      const id = req.params.id;
      const details = { '_id': new ObjectID(id) };

      db.collection('recipes').findOne(details, (error, oldRecipe) => {
        if (error) res.send(JSON.stringify({status: 500, massage: error}));

        db.collection('recipes').update(details, {...oldRecipe, versionsId: null}, (error, result) => {
          if (error) res.send(JSON.stringify({status: 500, massage: error}));
        });

        const { versionsId, version } = oldRecipe;
        const newRecipe = {
          title,
          description,
          guide,
          ingredients,
          dateCreated : new Date(),
          version     : version + 1,
          versionsId  : [ id, ...versionsId]
        }

        db.collection('recipes').insertOne(newRecipe, (error, result) => {
          if (error) res.send(JSON.stringify({status: 500, massage: error}));

          res.send(result.ops[0]);
        });
      });
    } else res.send(JSON.stringify({status: 'error', type : 'validation', fields: rules.update.getErrors()}));
  });

  app.delete('/recipes/:id', (req, res) => {
    const id = req.params.id;
    const details = { '_id': new ObjectID(id) };

    db.collection('recipes').remove(details, (error, item) => {
      if (error) res.send(JSON.stringify({status: 500, massage: error}));

      res.send(JSON.stringify({status: 200}));
    });
  });
};
const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const cors           = require('cors');
const app            = express();
const port           = 3002;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

MongoClient.connect("mongodb://localhost:27017/myexpressapi", { useUnifiedTopology: true }, (error, client) => {
  if (error)  console.log(error);

  const database = client.db('recipes');

  require('./app/routes')(app, database);

  app.listen(port, () => {
    console.log('API server started');
  });
});
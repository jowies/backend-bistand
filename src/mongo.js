import MongoClient from 'mongodb';

const MONGO_URL = 'mongodb://localhost:27017';

/* eslint-disable no-param-reassign */
export default function (app) {
  MongoClient.connect(
    MONGO_URL,
    { useNewUrlParser: true },
  )
    .then((connection) => {
      app.db = connection.db('bistand');
      app.votes = app.db.collection('votes');
      app.comments = app.db.collection('comments');
      console.log('Database connection established');
    })
    .catch(err => console.error(err));
}

const express = require('express');
const { ApolloServer, mergeSchemas } = require('apollo-server-express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

dotenv.config();
require('./config/bookshelf');
require('./models');

const album = require('./schemas/album');
const user = require('./schemas/user');

const { getMe } = require('./util/auth');

const server = new ApolloServer({
  schema: mergeSchemas({ schemas: [user, album] }),
  context: async ({ req }) => {
    const user = await getMe(req);

    return {
      user
    };
  }
});

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

server.applyMiddleware({ app });

if (process.env.NODE_ENV !== 'TEST') {
  app.listen({ port: 3000 }, () => {
    console.log(`Server running on http://localhost:3000${server.graphqlPath}`);
  });
}

module.exports = app;

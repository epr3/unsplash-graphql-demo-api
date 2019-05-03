const express = require('express');
const { ApolloServer, mergeSchemas } = require('apollo-server-express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');

dotenv.config();
global.fetch = require('node-fetch');
require('./config/bookshelf');
require('./models');

const album = require('./schemas/album');
const user = require('./schemas/user');

const { getMe } = require('./util/auth');

const linkTypeDefs = `
  extend type Album {
    user: User!
  }
`;

const server = new ApolloServer({
  schema: mergeSchemas({
    schemas: [user, album, linkTypeDefs],
    resolvers: {
      Album: {
        user: {
          resolve(parent, args, context, info) {
            return info.mergeInfo.delegateToSchema({
              schema: user,
              operation: 'query',
              fieldName: 'userById',
              args: {
                userId: parent.userId
              },
              context,
              info
            });
          }
        }
      }
    }
  }),
  context: async ({ req }) => {
    const user = await getMe(req);

    return {
      user: user ? user.context : null
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

import express = require('express');
import { ApolloServer, mergeSchemas } from 'apollo-server-express';
import bodyParser = require('body-parser');
import dotenv = require('dotenv');
import 'reflect-metadata';
import { createConnection } from 'typeorm';
import morgan = require('morgan');
import cors = require('cors');

dotenv.config();

import album from './schemas/album';
import user from './schemas/user';

import { getMe } from './util/auth';

const server = new ApolloServer({
  schema: mergeSchemas({ schemas: [user, album] }),
  context: async ({ req }) => {
    const user = await getMe(req);

    return {
      user
    }
  }
});

const app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

server.applyMiddleware({ app });

(async () => {
  try {
    await createConnection();
  } catch (e) {
    console.log('Error while connecting to the database', e);
    return e;
  }
  if (process.env.NODE_ENV !== 'TEST') {
    app.listen({ port: 3000 }, () => {
      console.log(
        `Server running on http://localhost:3000${server.graphqlPath}`
      );
    });
  }
})();

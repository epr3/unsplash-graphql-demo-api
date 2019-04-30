import { User } from '../models/user';
import { getRepository } from 'typeorm';
import jwt = require('jsonwebtoken');
import { makeExecutableSchema } from 'graphql-tools';
import { UserInputError, AuthenticationError } from 'apollo-server-errors';

const typeDefs = `
  type User {
    id: ID!
    name: String
    email: String
    password: String
  }
  type Query {
    me: User
  }
  type Mutation {
    login(email: String!, password: String!): String
    register(email: String!, password: String!, name: String!): String
  }`;

const resolvers = {
  Query: {
    me: async (
      _root: object,
      _args: object,
      { user }: { user: { id: string } }
    ) => {
      return await getRepository(User).find({ id: user.id });
    }
  },
  Mutation: {
    register: async (
      _root: object,
      {
        name,
        email,
        password
      }: { name: string; email: string; password: string }
    ) => {
      const user = await getRepository(User).create({ name, email, password });
      const response = await getRepository(User).save(user);
      return jwt.sign(
        { context: { id: response.id, email: response.email } },
        process.env.JWT_SECRET,
        { expiresIn: '1y' }
      );
    },
    login: async (
      _root: object,
      { email, password }: { email: string; password: string }
    ) => {
      const user = await getRepository(User).findOne({
        where: { email },
        select: ['id', 'email', 'password']
      });

      if (!user) {
        throw new UserInputError('No user found with this login credentials.');
      }

      if (!user.comparePassword(password)) {
        throw new AuthenticationError('The credentials were invalid!');
      }

      return jwt.sign(
        { context: { id: user.id, email: user.email } },
        process.env.JWT_SECRET,
        { expiresIn: '1y' }
      );
    }
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers
});

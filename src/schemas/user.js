const { User } = require('../models');
const jwt = require('jsonwebtoken');
const { makeExecutableSchema } = require('graphql-tools');
const { UserInputError, AuthenticationError } = require('apollo-server-errors');
const { combineResolvers } = require('graphql-resolvers');
const { isAuthenticated } = require('../resolvers/authenticate');

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
    me: combineResolvers(isAuthenticated, async (_root, _args, { user }) => {
      return await User.forge({ id: user.id }).fetch({ require: true });
    })
  },
  Mutation: {
    register: async (_root, { name, email, password }) => {
      const user = await User.forge({ name, email, password }).save();
      return jwt.sign(
        { context: { id: user.id, email: user.email } },
        process.env.JWT_SECRET,
        { expiresIn: '1y' }
      );
    },
    login: async (_root, { email, password }) => {
      const user = await User.forge({ email }).fetch();

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

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers
});

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
    userById(userId: ID!): User!
  }
  type Mutation {
    login(email: String!, password: String!): String
    register(email: String!, password: String!, name: String!): String
  }`;

const resolvers = {
  Query: {
    me: combineResolvers(isAuthenticated, async (_root, _args, { user }) => {
      const response = await User.forge({ id: user.id }).fetch({
        require: true
      });
      return response.toJSON();
    }),
    userById: combineResolvers(isAuthenticated, async (_root, { userId }) => {
      const response = await User.forge({ id: userId }).fetch({
        require: true
      });
      return response.toJSON();
    })
  },
  Mutation: {
    register: async (_root, { name, email, password }) => {
      const user = await User.forge({ name, email, password }).save();
      const response = user.toJSON();
      return jwt.sign(
        { context: { id: response.id, email: response.email } },
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

      const response = user.toJSON();

      return jwt.sign(
        { context: { id: response.id, email: response.email } },
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

const { ForbiddenError } = require('apollo-server-errors');
const { skip } = require('graphql-resolvers');

module.exports = {
  isAuthenticated: (_parent, _args, { user }) =>
    user ? skip : new ForbiddenError('Not authenticated as user')
};

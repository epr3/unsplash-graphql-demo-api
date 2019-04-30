import { ForbiddenError } from 'apollo-server-errors';
import { skip } from 'graphql-resolvers';

export const isAuthenticated = (_parent: object, _args: object, { user }) =>
  user ? skip : new ForbiddenError('Not authenticated as user');

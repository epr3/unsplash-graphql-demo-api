const Album = require('../models');
const { ForbiddenError } = require('apollo-server-errors');
const { skip } = require('graphql-resolvers');

module.exports = {
  isAlbumOwner: async (_, { id }, { user }) => {
    const album = await Album.forge({ id, userId: user.id }).fetch();
    if (!album) {
      throw new ForbiddenError('Not authenticated as owner');
    }
    return skip;
  }
};

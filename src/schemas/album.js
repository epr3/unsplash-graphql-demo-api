const { isAlbumOwner } = require('../resolvers/albumOwner');
const { Album, Image } = require('../models');
const { makeExecutableSchema } = require('graphql-tools');
const { combineResolvers } = require('graphql-resolvers');
const { isAuthenticated } = require('../resolvers/authenticate');

const typeDefs = `
  type Image {
    id: ID!
    unsplashId: String
  }
  type Album {
    id: ID!
    name: String
    images: [Image]
    userId: ID!
  }
  type Query {
    album(id: ID!): Album
    albums: [Album]!
  }
  type AlbumResponse {
    id: String
    name: String
    images: [Image]
  }
  type Mutation {
    createAlbum(name: String!, unsplashIds: [String]!): AlbumResponse!
    updateAlbum(name: String!): AlbumResponse!
    deleteAlbum(id: ID!): Boolean!
    addImagesToAlbum(id: ID!, unsplashIds: [String]!): AlbumResponse!
    deleteImagesFromAlbum(id: ID, unsplashIds: [String]!): Boolean!
  }`;

const resolvers = {
  Query: {
    album: combineResolvers(
      isAuthenticated,
      async (_root, { id }) =>
        await Album.forge({ id }).fetch({ require: true })
    ),
    albums: combineResolvers(
      isAuthenticated,
      async () => await Album.forge().fetchAll()
    )
  },
  Mutation: {
    createAlbum: combineResolvers(
      isAuthenticated,
      async (_root, { name, unsplashIds }, { user }) => {
        const album = await Album.forge({
          name,
          userId: user.id
        }).save();
        unsplashIds.map(
          async item =>
            await Image.forge({
              unsplashId: item,
              albumId: album.id
            }).save()
        );
        return album;
      }
    ),
    updateAlbum: combineResolvers(
      isAuthenticated,
      isAlbumOwner,
      async (_root, { id, name }) => {
        const album = await Album.forge(id)
          .fetch({ require: true })
          .save({ name });
        return album;
      }
    ),
    deleteAlbum: combineResolvers(
      isAuthenticated,
      isAlbumOwner,
      async (_root, { id }) => {
        return Album.forge({ id })
          .fetch({ require: true })
          .destroy();
      }
    ),
    addImagesToAlbum: combineResolvers(
      isAuthenticated,
      isAlbumOwner,
      async (_root, { id, unsplashIds }) => {
        const images = unsplashIds.map(
          async unsplashId =>
            await Image.forge({
              unsplashId,
              albumId: id
            }).save()
        );
        return images;
      }
    ),
    deleteImagesFromAlbum: combineResolvers(
      isAuthenticated,
      isAlbumOwner,
      async (_root, { unsplashIds }) => {
        return unsplashIds.map(
          async item =>
            await item
              .forge({ id: item })
              .fetch({ require: true })
              .destroy()
        );
      }
    )
  }
};

module.exports = makeExecutableSchema({
  typeDefs,
  resolvers
});

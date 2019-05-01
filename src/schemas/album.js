const { isAlbumOwner } = require('../resolvers/albumOwner');
const { Album, Image } = require('../models');
const { makeExecutableSchema } = require('graphql-tools');
const { combineResolvers } = require('graphql-resolvers');
const { isAuthenticated } = require('../resolvers/authenticate');
const unsplash = require('../config/unsplash');
const { toJson } = require('unsplash-js');

const typeDefs = `
  type Image {
    id: ID
    unsplashId: String
    imageLink: String
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
    images: [Image]!
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
    images: combineResolvers(isAuthenticated, async () => {
      const photos = await unsplash.photos.listPhotos();
      const response = await toJson(photos);
      return response.map(item => ({
        unsplashId: item.id,
        imageLink: item.urls.regular
      }));
    }),
    album: combineResolvers(isAuthenticated, async (_root, { id }) => {
      const response = await Album.forge({ id }).fetch({ require: true });
      return response.toJSON();
    }),
    albums: combineResolvers(isAuthenticated, async () => {
      const response = await Album.forge().fetchAll();
      return response.toJSON();
    })
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
        return album.toJSON();
      }
    ),
    updateAlbum: combineResolvers(
      isAuthenticated,
      isAlbumOwner,
      async (_root, { id, name }) => {
        const album = await Album.forge(id)
          .fetch({ require: true })
          .save({ name });
        return album.toJSON();
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
        return images.toJSON();
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

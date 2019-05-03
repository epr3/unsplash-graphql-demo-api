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
    album(id: ID!): Album!
    albums(userId: ID): [Album]!
    albumsByUserId(userId: ID!): [Album]!
    images(page: Int): [Image]!
  }
  input InputImage {
    unsplashId: String!
    imageLink: String!
  }
  type Mutation {
    createAlbum(name: String!, images: [InputImage]!): Album!
    updateAlbum(name: String!): Album!
    deleteAlbum(id: ID!): Boolean!
    addImagesToAlbum(id: ID!, unsplashIds: [String]!): Album!
    deleteImagesFromAlbum(id: ID, unsplashIds: [String]!): Boolean!
  }`;

const resolvers = {
  Query: {
    images: combineResolvers(isAuthenticated, async (_root, { page }) => {
      const photos = await unsplash.photos.listPhotos(page, 16);
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
    albums: combineResolvers(isAuthenticated, async (_root, { userId }) => {
      let albumForge = Album.forge();
      if (userId) {
        albumForge = Album.forge({ userId });
      }
      const response = await albumForge.fetchAll({
        withRelated: ['images']
      });
      return response.toJSON();
    })
  },
  Mutation: {
    createAlbum: combineResolvers(
      isAuthenticated,
      async (_root, { name, images }, { user }) => {
        const album = await Album.forge({
          name,
          userId: user.id
        }).save();
        const imagesResponse = await images.map(
          async item =>
            await Image.forge({
              unsplashId: item.unsplashId,
              imageLink: item.imageLink,
              albumId: album.id
            }).save()
        );
        return {
          ...album.toJSON(),
          images: imagesResponse.map(async item => await item.toJSON())
        };
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

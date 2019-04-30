import { isAlbumOwner } from './../resolvers/albumOwner';
import { Album } from '../models/album';
import { getRepository, DeepPartial } from 'typeorm';
import { Image } from '../models/image';
import { makeExecutableSchema } from 'graphql-tools';
import { combineResolvers } from 'graphql-resolvers';
import { isAuthenticated } from '../resolvers/authenticate';

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
      async (_root: object, { id }: { id: string }) =>
        await getRepository(Album).findOneOrFail(id)
    ),
    albums: combineResolvers(
      isAuthenticated,
      async (
        _root: object,
        _args: object,
        { user }: { user: { id: string } }
      ) => await getRepository(Album).find({ where: { userId: user.id } })
    )
  },
  Mutation: {
    createAlbum: combineResolvers(
      isAuthenticated,
      async (
        _root: object,
        { name, unsplashIds }: { name: string; unsplashIds: string[] },
        { user }: { user: { id: string } }
      ) => {
        const album = await getRepository(Album).create({
          name,
          user: { id: user.id }
        });
        const response = await getRepository(Album).save(album);
        const images = unsplashIds.map(
          async (item: string) =>
            await getRepository(Image).create({
              unsplashId: item,
              album
            })
        ) as DeepPartial<Image>;
        await getRepository(Image).save(images);
        return response;
      }
    ),
    updateAlbum: combineResolvers(
      isAuthenticated,
      isAlbumOwner,
      async (_root: object, { id, name }: { id: string; name: string }) => {
        const album = await getRepository(Album).update(id, { name });
        return album;
      }
    ),
    deleteAlbum: combineResolvers(
      isAuthenticated,
      isAlbumOwner,
      async (_root: object, { id }: { id: string }) => {
        return await getRepository(Album).delete(id);
      }
    ),
    addImagesToAlbum: combineResolvers(
      isAuthenticated,
      isAlbumOwner,
      async (
        _root: object,
        { id, unsplashIds }: { id: string; unsplashIds: string[] }
      ) => {
        const images = unsplashIds.map(
          async (unsplashId: string) =>
            await getRepository(Image).create({
              unsplashId,
              album: { id }
            })
        ) as DeepPartial<Image>;
        return await getRepository(Image).save(images);
      }
    ),
    deleteImagesFromAlbum: combineResolvers(
      isAuthenticated,
      isAlbumOwner,
      async (_root: object, { unsplashIds }: { unsplashIds: string[] }) => {
        return await getRepository(Image).delete(unsplashIds);
      }
    )
  }
};

export default makeExecutableSchema({
  typeDefs,
  resolvers
});

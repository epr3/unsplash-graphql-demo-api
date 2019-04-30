import { Album } from './../models/album';
import { ForbiddenError } from 'apollo-server-errors';
import { skip } from 'graphql-resolvers';
import { getRepository } from 'typeorm';

export const isAlbumOwner = async (
  _parent: object,
  { id }: { id: string },
  { user }
) => {
  const album = await getRepository(Album).findOne(id, {
    where: { userId: user.id }
  });
  if (!album) {
    throw new ForbiddenError('Not authenticated as owner');
  }
  return skip;
};

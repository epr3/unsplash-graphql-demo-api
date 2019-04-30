import { Request } from 'express';
import jwt = require('jsonwebtoken');
import { AuthenticationError } from 'apollo-server-errors';

export const getMe = async (req: Request) => {
  const token = req.header('Authorization');
  if (token) {
    try {
      return await jwt.verify(token.split('JWT ')[1], process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
};

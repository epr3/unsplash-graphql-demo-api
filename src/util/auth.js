const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-errors');

module.exports = {
  getMe: async req => {
    const token = req.header('Authorization');
    if (token) {
      try {
        return await jwt.verify(token.split('JWT ')[1], process.env.SECRET);
      } catch (e) {
        throw new AuthenticationError('Your session expired. Sign in again.');
      }
    }
  }
};

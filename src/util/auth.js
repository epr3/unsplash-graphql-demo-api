const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server-errors');

module.exports = {
  getMe: async req => {
    const token = req.header('Authorization');
    if (token) {
      try {
        await jwt.verify(token.split('JWT ')[1], process.env.JWT_SECRET);
        return jwt.decode(token.split('JWT ')[1]);
      } catch (e) {
        throw new AuthenticationError('Your session expired. Sign in again.');
      }
    }
  }
};

const Unsplash = require('unsplash-js').default;

module.exports = new Unsplash({
  applicationId: process.env.UNSPLASH_ACCESS,
  secret: process.env.UNSPLASH_SECRET
});

const knexConfig = require('../../knexfile');
const knex = require('knex')(knexConfig.development);
const Schema = require('bookshelf-schema');

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin('registry');
bookshelf.plugin('visibility');
bookshelf.plugin(require('bookshelf-uuid'));
bookshelf.plugin(Schema);

module.exports = bookshelf;

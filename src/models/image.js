const bookshelf = require('../config/bookshelf');
const Fields = require('bookshelf-schema/lib/fields');
const Relations = require('bookshelf-schema/lib/relations');

module.exports = bookshelf.model('Image', {
  tableName: 'images',
  uuid: true,
  schema: [Fields.StringField('unsplashId'), Relations.BelongsTo('Album')],
  album: function() {
    return this.belongsTo('Album');
  }
});

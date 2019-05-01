const bookshelf = require('../config/bookshelf');
const Fields = require('bookshelf-schema/lib/fields');
const Relations = require('bookshelf-schema/lib/relations');

module.exports = bookshelf.model('Album', {
  tableName: 'albums',
  uuid: true,
  schema: [
    Fields.StringField('name'),
    Relations.BelongsTo('User'),
    Relations.HasMany('Image')
  ],
  images: function() {
    return this.hasMany('Image');
  },
  user: function() {
    return this.belongsTo('Album');
  }
});

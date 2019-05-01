const bookshelf = require('../config/bookshelf');
const bcrypt = require('bcryptjs');
const Fields = require('bookshelf-schema/lib/fields');
const Relations = require('bookshelf-schema/lib/relations');

module.exports = bookshelf.model('User', {
  tableName: 'users',
  hidden: ['password'],
  schema: [
    Fields.StringField('name'),
    Fields.EmailField('email'),
    Relations.HasMany('Album')
  ],
  comparePassword: async function(password) {
    return await bcrypt.compare(password, this.get('password'));
  },
  initialize: function() {
    const saltRounds = 10;
    this.on('creating', async () => {
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(this.get('password'), salt);
      this.set('password', hash);
    });
  },
  albums: function() {
    return this.many('Album');
  }
});

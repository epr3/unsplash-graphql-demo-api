exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('users', table => {
      table.uuid('id').primary();
      table.string('name');
      table.string('email');
      table.unique('email');
      table.integer('password');
    })
    .createTable('albums', table => {
      table.uuid('id').primary();
      table.string('name');
      table
        .uuid('userId')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
        .index();
    })
    .createTable('images', table => {
      table.uuid('id').primary();
      table.string('unsplashId');
      table
        .uuid('albumId')
        .references('id')
        .inTable('albums')
        .onDelete('SET NULL')
        .index();
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('images')
    .dropTableIfExists('albums')
    .dropTableIfExists('users');
};

/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('tbl_notes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNUll: true,
    },
    body: {
      type: 'TEXT',
      notNUll: true,
    },
    tags: {
      type: 'TEXT[]',
      notNUll: true,
    },
    created_at: {
      type: 'TEXT',
      notNUll: true,
    },
    updated_at: {
      type: 'TEXT',
      notNUll: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('tbl_notes');
};

/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat table collaborations
  pgm.createTable('tbl_collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    note_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  /*
    Menambahkan constraint UNIQUE, kombinasi dari kolom note_id dan user_id.
    Guna menghindari duplikasi data antara nilai keduanya.
  */
  pgm.addConstraint(
    'tbl_collaborations',
    'unique_note_id_and_user_id',
    'UNIQUE(note_id, user_id)'
  );

  // memberikan constraint foreign key pada kolom note_id dan user_id terhadap notes.id dan users.id
  pgm.addConstraint(
    'tbl_collaborations',
    'fk_tbl_collaborations.note_id_notes.id',
    'FOREIGN KEY(note_id) REFERENCES tbl_notes(id) ON DELETE CASCADE'
  );
  pgm.addConstraint(
    'tbl_collaborations',
    'fk_tbl_collaborations.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES tbl_users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  // menghapus tabel collaborations
  pgm.dropTable('tbl_collaborations');
};

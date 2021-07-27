/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat user baru.
  pgm.sql(
    "INSERT INTO tbl_users(id, username, password, fullname) VALUES ('old_notes', 'old_notes', 'old_notes', 'old notes')"
  );

  // mengubah nilai owner pada note yang owner-nya bernilai NULL
  pgm.sql("UPDATE tbl_notes SET owner = 'old_notes' WHERE owner = NULL");

  // memberikan constraint foreign key pada owner terhadap kolom id dari tabel users
  pgm.addConstraint(
    'tbl_notes',
    'fk_tbl_notes.owner_tbl_users.id',
    'FOREIGN KEY(owner) REFERENCES tbl_users(id) ON DELETE CASCADE'
  );
};

exports.down = (pgm) => {
  // menghapus constraint fk_notes.owner_users.id pada tabel notes
  pgm.dropConstraint('tbl_notes', 'fk_tbl_notes.owner_tbl_users.id');

  // mengubah nilai owner old_notes pada note menjadi NULL
  pgm.sql("UPDATE tbl_notes SET owner = NULL WHERE owner = 'old_notes'");

  // menghapus user baru.
  pgm.sql("DELETE FROM tbl_users WHERE id = 'old_notes'");
};

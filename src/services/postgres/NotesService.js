const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToModel } = require('../../utils');

class NotesService {
  constructor(collaborationService, cacheService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
    this._cacheService = cacheService;
  }

  async addNote({ title, body, tags, owner }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO tbl_notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };

    await this._cacheService.delete(`notes:${owner}`);
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getNotes(owner) {
    try {
      // mendapatkan catatan dari cache
      const result = await this._cacheService.get(`notes:${owner}`);
      return JSON.parse(result);
    } catch (error) {
      const query = {
        text: 'SELECT tbl_notes.* FROM tbl_notes LEFT JOIN tbl_collaborations ON tbl_collaborations.note_id = tbl_notes.id WHERE tbl_notes.owner = $1 OR tbl_collaborations.user_id = $1 GROUP BY tbl_notes.id',
        values: [owner],
      };
      const result = await this._pool.query(query);
      const mappedResult = result.rows.map(mapDBToModel);
  
      await this._cacheService.set(`notes:${owner}`, JSON.stringify(mappedResult));
   
      return mappedResult;
    }
  }

  async getNoteById(id) {
    const query = {
      text: 'SELECT tbl_notes.*, tbl_users.username FROM tbl_notes LEFT JOIN tbl_users ON tbl_users.id = tbl_notes.owner WHERE tbl_notes.id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan!');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editNoteById(id, { title, body, tags }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE tbl_notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id',
      values: [title, body, tags, updatedAt, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    const { owner } = result.rows[0];
    await this._cacheService.delete(`notes:${owner}`);
  }

  async deleteNoteById(id) {
    const query = {
      text: 'DELETE FROM tbl_notes WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
    
    const { owner } = result.rows[0];
    await this._cacheService.delete(`notes:${owner}`);
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM tbl_notes WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }
    const note = result.rows[0];
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyNoteAccess(noteId, userId) {
    try {
      await this.verifyNoteOwner(noteId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationService.verifyCollaborator(noteId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = NotesService;

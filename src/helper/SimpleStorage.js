const Database = require('better-sqlite3');
const path = require('path');

/**
 * Simple key-value storage using SQLite that mimics Enmap's interface
 */
class SimpleStorage {
  constructor(options = {}) {
    const dbName = options.name || 'storage';
    const dbPath = path.join(process.cwd(), `${dbName}.sqlite`);
    
    this.db = new Database(dbPath);
    
    // Create table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS storage (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);
    
    // Prepare statements for better performance
    this.getStmt = this.db.prepare('SELECT value FROM storage WHERE key = ?');
    this.setStmt = this.db.prepare('INSERT OR REPLACE INTO storage (key, value) VALUES (?, ?)');
    this.deleteStmt = this.db.prepare('DELETE FROM storage WHERE key = ?');
    this.hasStmt = this.db.prepare('SELECT 1 FROM storage WHERE key = ?');
    this.keysStmt = this.db.prepare('SELECT key FROM storage');
  }

  /**
   * Get a value by key
   * @param {string} key 
   * @returns {*} The stored value or undefined
   */
  get(key) {
    const row = this.getStmt.get(key);
    return row ? JSON.parse(row.value) : undefined;
  }

  /**
   * Set a value for a key
   * @param {string} key 
   * @param {*} value 
   * @returns {SimpleStorage} this (for chaining)
   */
  set(key, value) {
    this.setStmt.run(key, JSON.stringify(value));
    return this;
  }

  /**
   * Check if a key exists
   * @param {string} key 
   * @returns {boolean}
   */
  has(key) {
    return this.hasStmt.get(key) !== undefined;
  }

  /**
   * Delete a key
   * @param {string} key 
   * @returns {boolean} true if deleted, false if didn't exist
   */
  delete(key) {
    const result = this.deleteStmt.run(key);
    return result.changes > 0;
  }

  /**
   * Get all keys as an array
   * @returns {string[]}
   */
  keyArray() {
    return this.keysStmt.all().map(row => row.key);
  }

  /**
   * Clear all data
   */
  clear() {
    this.db.exec('DELETE FROM storage');
  }

  /**
   * Close the database connection
   */
  close() {
    this.db.close();
  }
}

module.exports = SimpleStorage;

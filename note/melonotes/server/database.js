const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, 'melonotes.db'), (err) => {
      if (err) {
        console.error('💔 Database connection error:', err);
      } else {
        console.log('💖 Connected to MELONOTES database for Melo!');
        this.init();
      }
    });
  }

  init() {
    const sql = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#FF69B4',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        problem TEXT,
        problem_definition TEXT,
        analysis TEXT,
        why_solution_a TEXT,
        why_switch_to_b TEXT,
        category_id INTEGER,
        priority INTEGER DEFAULT 1,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories (id)
      );

      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#FF69B4',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS note_tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
        UNIQUE(note_id, tag_id)
      );

      CREATE TABLE IF NOT EXISTS solutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        plan_type TEXT NOT NULL,
        description TEXT NOT NULL,
        reasoning TEXT,
        priority INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        solution_id INTEGER NOT NULL,
        step_number INTEGER NOT NULL,
        description TEXT NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (solution_id) REFERENCES solutions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS code_snippets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        solution_id INTEGER,
        title TEXT,
        language TEXT DEFAULT 'sql',
        code TEXT NOT NULL,
        description TEXT,
        execution_order INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (solution_id) REFERENCES solutions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS scripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        solution_id INTEGER,
        title TEXT NOT NULL,
        script_type TEXT DEFAULT 'bash',
        content TEXT NOT NULL,
        description TEXT,
        execution_order INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE,
        FOREIGN KEY (solution_id) REFERENCES solutions (id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        note_id INTEGER NOT NULL,
        filename TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (note_id) REFERENCES notes (id) ON DELETE CASCADE
      );

      INSERT OR IGNORE INTO tags (name, color) VALUES 
        ('MSSQL', '#FF6B6B'),
        ('PostgreSQL', '#4ECDC4'),
        ('MySQL', '#45B7D1'),
        ('Oracle', '#96CEB4'),
        ('MongoDB', '#FECA57'),
        ('Redis', '#FF9F43'),
        ('Performance', '#FF6348'),
        ('Indexing', '#A0E7E5'),
        ('Query Optimization', '#FFA726'),
        ('Backup', '#66BB6A'),
        ('Recovery', '#EF5350'),
        ('Security', '#AB47BC'),
        ('Replication', '#26C6DA'),
        ('Cluster', '#7E57C2'),
        ('Migration', '#FF7043');
    `;

    this.db.exec(sql, (err) => {
      if (err) {
        console.error('💔 Database initialization error:', err);
      } else {
        console.log('💝 Database initialized with love for Melo!');
        this.createDefaultUser();
      }
    });
  }

  createDefaultUser() {
    const username = 'frieren';
    const password = 'MeldaErkan!5352';
    
    this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        console.error('💔 Error checking user:', err);
        return;
      }
      
      if (!user) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        
        this.db.run(
          'INSERT INTO users (username, password) VALUES (?, ?)',
          [username, hashedPassword],
          function(err) {
            if (err) {
              console.error('💔 Error creating default user:', err);
            } else {
              console.log('💖 Default user "frieren" created for Melo!');
            }
          }
        );
      }
    });
  }

  getDB() {
    return this.db;
  }

  close() {
    this.db.close((err) => {
      if (err) {
        console.error('💔 Error closing database:', err);
      } else {
        console.log('💖 Database connection closed gracefully');
      }
    });
  }
}

module.exports = new Database();
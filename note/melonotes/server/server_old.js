const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const database = require('./database');
const { generateToken, authMiddleware, comparePassword } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });
const db = database.getDB();

// 💖 Welcome message for Melo
app.get('/', (req, res) => {
  res.json({ 
    message: "💝 Welcome to MELONOTES API - Made with love for Melo! 💖",
    endpoints: [
      "POST /api/auth/login - Login",
      "GET /api/notes - Get all notes (protected)",
      "POST /api/notes - Create new note (protected)",
      "GET /api/categories - Get categories (protected)",
      "POST /api/upload - Upload images (protected)"
    ]
  });
});

// LOGIN endpoint
app.post('/api/auth/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: '💔 Database error' });
    }
    
    if (!user) {
      return res.status(401).json({ error: '💔 Invalid credentials' });
    }
    
    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ error: '💔 Invalid credentials' });
    }
    
    const token = generateToken(user.id, user.username);
    
    res.json({
      message: `💖 Welcome back to MELONOTES, ${user.username}! Made with love for Melo! 💖`,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
  });
});

// Verify token endpoint
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({
    message: '💖 Token is valid for Melo!',
    user: {
      id: req.user.userId,
      username: req.user.username
    }
  });
});

// GET all notes with related data
app.get('/api/notes', authMiddleware, (req, res) => {
  const sql = `
    SELECT n.*, c.name as category_name, c.color as category_color
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    ORDER BY n.updated_at DESC
  `;
  
  db.all(sql, [], (err, notes) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Get solutions, steps, code snippets, and images for each note
    const notePromises = notes.map(note => {
      return new Promise((resolve) => {
        // Get solutions
        db.all('SELECT * FROM solutions WHERE note_id = ? ORDER BY priority', [note.id], (err, solutions) => {
          if (err) {
            note.solutions = [];
          } else {
            note.solutions = solutions;
          }
          
          // Get steps for each solution
          const stepPromises = note.solutions.map(solution => {
            return new Promise((stepResolve) => {
              db.all('SELECT * FROM steps WHERE solution_id = ? ORDER BY step_number', [solution.id], (err, steps) => {
                solution.steps = err ? [] : steps;
                stepResolve();
              });
            });
          });
          
          Promise.all(stepPromises).then(() => {
            // Get code snippets
            db.all('SELECT * FROM code_snippets WHERE note_id = ? ORDER BY created_at', [note.id], (err, codes) => {
              note.code_snippets = err ? [] : codes;
              
              // Get images
              db.all('SELECT * FROM images WHERE note_id = ? ORDER BY created_at', [note.id], (err, images) => {
                note.images = err ? [] : images;
                resolve(note);
              });
            });
          });
        });
      });
    });
    
    Promise.all(notePromises).then(completeNotes => {
      res.json(completeNotes);
    });
  });
});

// GET single note
app.get('/api/notes/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT n.*, c.name as category_name, c.color as category_color FROM notes n LEFT JOIN categories c ON n.category_id = c.id WHERE n.id = ?', [id], (err, note) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    
    // Get related data
    db.all('SELECT * FROM solutions WHERE note_id = ? ORDER BY priority', [id], (err, solutions) => {
      note.solutions = err ? [] : solutions;
      
      db.all('SELECT * FROM code_snippets WHERE note_id = ? ORDER BY created_at', [id], (err, codes) => {
        note.code_snippets = err ? [] : codes;
        
        db.all('SELECT * FROM images WHERE note_id = ? ORDER BY created_at', [id], (err, images) => {
          note.images = err ? [] : images;
          res.json(note);
        });
      });
    });
  });
});

// POST create new note
app.post('/api/notes', authMiddleware, [
  body('title').notEmpty().withMessage('Title is required'),
  body('problem').optional(),
  body('analysis').optional()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, problem, analysis, category_id, solutions, code_snippets } = req.body;
  
  db.run(
    'INSERT INTO notes (title, problem, analysis, category_id) VALUES (?, ?, ?, ?)',
    [title, problem, analysis, category_id || 4],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      const noteId = this.lastID;
      
      // Insert solutions if provided
      if (solutions && solutions.length > 0) {
        const solutionPromises = solutions.map((solution, index) => {
          return new Promise((resolve) => {
            db.run(
              'INSERT INTO solutions (note_id, plan_type, description, priority) VALUES (?, ?, ?, ?)',
              [noteId, solution.plan_type || `Plan ${String.fromCharCode(65 + index)}`, solution.description, solution.priority || index + 1],
              function(err) {
                if (!err && solution.steps) {
                  const solutionId = this.lastID;
                  const stepPromises = solution.steps.map((step, stepIndex) => {
                    return new Promise((stepResolve) => {
                      db.run(
                        'INSERT INTO steps (solution_id, step_number, description) VALUES (?, ?, ?)',
                        [solutionId, stepIndex + 1, step.description],
                        () => stepResolve()
                      );
                    });
                  });
                  Promise.all(stepPromises).then(() => resolve());
                } else {
                  resolve();
                }
              }
            );
          });
        });
        
        Promise.all(solutionPromises).then(() => {
          insertCodeSnippets();
        });
      } else {
        insertCodeSnippets();
      }
      
      function insertCodeSnippets() {
        if (code_snippets && code_snippets.length > 0) {
          const codePromises = code_snippets.map(code => {
            return new Promise((resolve) => {
              db.run(
                'INSERT INTO code_snippets (note_id, language, code, description) VALUES (?, ?, ?, ?)',
                [noteId, code.language || 'sql', code.code, code.description],
                () => resolve()
              );
            });
          });
          
          Promise.all(codePromises).then(() => {
            res.json({ id: noteId, message: '💝 Note created with love for Melo!' });
          });
        } else {
          res.json({ id: noteId, message: '💝 Note created with love for Melo!' });
        }
      }
    }
  );
});

// GET categories
app.get('/api/categories', authMiddleware, (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// POST upload image
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const { note_id, description } = req.body;
  
  if (note_id) {
    db.run(
      'INSERT INTO images (note_id, filename, description) VALUES (?, ?, ?)',
      [note_id, req.file.filename, description || ''],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ 
          message: '💖 Image uploaded for Melo!', 
          filename: req.file.filename,
          id: this.lastID 
        });
      }
    );
  } else {
    res.json({ 
      message: '💖 Image uploaded for Melo!', 
      filename: req.file.filename 
    });
  }
});

// PUT update step completion
app.put('/api/steps/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;
  
  db.run('UPDATE steps SET completed = ? WHERE id = ?', [completed, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: `💝 Step ${completed ? 'completed' : 'reopened'} for Melo!` });
  });
});

// DELETE note
app.delete('/api/notes/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM notes WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: '💔 Note deleted (but Melo is still loved!)' });
  });
});

app.listen(PORT, () => {
  console.log(`💖 MELONOTES Server running on port ${PORT} for my beloved Melo! 💖`);
});

process.on('SIGINT', () => {
  console.log('\n💖 Shutting down gracefully for Melo...');
  database.close();
  process.exit(0);
});
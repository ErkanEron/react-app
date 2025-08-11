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
      "GET /api/tags - Get tags (protected)",
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

// CATEGORIES ENDPOINTS
app.get('/api/categories', authMiddleware, (req, res) => {
  db.all('SELECT * FROM categories ORDER BY name', [], (err, categories) => {
    if (err) {
      return res.status(500).json({ error: '💔 Database error fetching categories' });
    }
    res.json(categories);
  });
});

app.post('/api/categories', authMiddleware, [
  body('name').notEmpty().withMessage('Category name is required'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, color = '#FF69B4' } = req.body;
  
  db.run('INSERT INTO categories (name, color) VALUES (?, ?)', [name, color], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: '💔 Category already exists' });
      }
      return res.status(500).json({ error: '💔 Database error creating category' });
    }
    
    res.json({ 
      id: this.lastID, 
      name, 
      color,
      message: '💖 Category created successfully for Melo!' 
    });
  });
});

app.put('/api/categories/:id', authMiddleware, [
  body('name').notEmpty().withMessage('Category name is required'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, color } = req.body;
  
  db.run('UPDATE categories SET name = ?, color = ? WHERE id = ?', [name, color, id], function(err) {
    if (err) {
      return res.status(500).json({ error: '💔 Database error updating category' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '💔 Category not found' });
    }
    
    res.json({ message: '💖 Category updated successfully for Melo!' });
  });
});

app.delete('/api/categories/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: '💔 Database error deleting category' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '💔 Category not found' });
    }
    
    res.json({ message: '💖 Category deleted successfully for Melo!' });
  });
});

// TAGS ENDPOINTS
app.get('/api/tags', authMiddleware, (req, res) => {
  db.all('SELECT * FROM tags ORDER BY name', [], (err, tags) => {
    if (err) {
      return res.status(500).json({ error: '💔 Database error fetching tags' });
    }
    res.json(tags);
  });
});

app.post('/api/tags', authMiddleware, [
  body('name').notEmpty().withMessage('Tag name is required'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, color = '#FF69B4' } = req.body;
  
  db.run('INSERT INTO tags (name, color) VALUES (?, ?)', [name, color], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: '💔 Tag already exists' });
      }
      return res.status(500).json({ error: '💔 Database error creating tag' });
    }
    
    res.json({ 
      id: this.lastID, 
      name, 
      color,
      message: '💖 Tag created successfully for Melo!' 
    });
  });
});

app.delete('/api/tags/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM tags WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: '💔 Database error deleting tag' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '💔 Tag not found' });
    }
    
    res.json({ message: '💖 Tag deleted successfully for Melo!' });
  });
});

// GET all notes with enhanced data including tags
app.get('/api/notes', authMiddleware, (req, res) => {
  const { search, category, tags, status } = req.query;
  
  let sql = `
    SELECT n.*, c.name as category_name, c.color as category_color,
           GROUP_CONCAT(DISTINCT t.name) as tag_names,
           GROUP_CONCAT(DISTINCT t.id) as tag_ids,
           GROUP_CONCAT(DISTINCT t.color) as tag_colors
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
  `;
  
  const conditions = [];
  const params = [];
  
  if (search) {
    conditions.push(`(n.title LIKE ? OR n.problem LIKE ? OR n.analysis LIKE ? OR n.problem_definition LIKE ?)`);
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  
  if (category) {
    conditions.push('n.category_id = ?');
    params.push(category);
  }
  
  if (status) {
    conditions.push('n.status = ?');
    params.push(status);
  }
  
  if (tags) {
    const tagIds = tags.split(',');
    const tagPlaceholders = tagIds.map(() => '?').join(',');
    conditions.push(`n.id IN (SELECT note_id FROM note_tags WHERE tag_id IN (${tagPlaceholders}))`);
    params.push(...tagIds);
  }
  
  if (conditions.length > 0) {
    sql += ` WHERE ${conditions.join(' AND ')}`;
  }
  
  sql += ` GROUP BY n.id ORDER BY n.updated_at DESC`;
  
  db.all(sql, params, (err, notes) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: '💔 Database error fetching notes' });
    }
    
    // Format tags for each note
    const formattedNotes = notes.map(note => ({
      ...note,
      tags: note.tag_names ? note.tag_names.split(',').map((name, index) => ({
        id: note.tag_ids.split(',')[index],
        name,
        color: note.tag_colors.split(',')[index]
      })) : []
    }));
    
    res.json(formattedNotes);
  });
});

// GET single note with all related data
app.get('/api/notes/:id', authMiddleware, (req, res) => {
  const noteId = req.params.id;
  
  // Get note with category and tags
  const noteQuery = `
    SELECT n.*, c.name as category_name, c.color as category_color
    FROM notes n
    LEFT JOIN categories c ON n.category_id = c.id
    WHERE n.id = ?
  `;
  
  db.get(noteQuery, [noteId], (err, note) => {
    if (err) {
      return res.status(500).json({ error: '💔 Database error fetching note' });
    }
    
    if (!note) {
      return res.status(404).json({ error: '💔 Note not found' });
    }
    
    // Get tags for this note
    const tagsQuery = `
      SELECT t.* FROM tags t
      JOIN note_tags nt ON t.id = nt.tag_id
      WHERE nt.note_id = ?
    `;
    
    db.all(tagsQuery, [noteId], (err, tags) => {
      if (err) {
        return res.status(500).json({ error: '💔 Database error fetching tags' });
      }
      
      // Get solutions with steps
      const solutionsQuery = `
        SELECT s.*, 
               GROUP_CONCAT(st.id) as step_ids,
               GROUP_CONCAT(st.step_number) as step_numbers,
               GROUP_CONCAT(st.description) as step_descriptions,
               GROUP_CONCAT(st.completed) as step_completed
        FROM solutions s
        LEFT JOIN steps st ON s.id = st.solution_id
        WHERE s.note_id = ?
        GROUP BY s.id
        ORDER BY s.priority
      `;
      
      db.all(solutionsQuery, [noteId], (err, solutions) => {
        if (err) {
          return res.status(500).json({ error: '💔 Database error fetching solutions' });
        }
        
        // Format solutions with steps
        const formattedSolutions = solutions.map(solution => ({
          ...solution,
          steps: solution.step_ids ? solution.step_ids.split(',').map((id, index) => ({
            id: parseInt(id),
            step_number: parseInt(solution.step_numbers.split(',')[index]),
            description: solution.step_descriptions.split(',')[index],
            completed: solution.step_completed.split(',')[index] === '1'
          })) : []
        }));
        
        // Get code snippets
        const codeQuery = 'SELECT * FROM code_snippets WHERE note_id = ? ORDER BY execution_order';
        
        db.all(codeQuery, [noteId], (err, codeSnippets) => {
          if (err) {
            return res.status(500).json({ error: '💔 Database error fetching code snippets' });
          }
          
          // Get scripts
          const scriptsQuery = 'SELECT * FROM scripts WHERE note_id = ? ORDER BY execution_order';
          
          db.all(scriptsQuery, [noteId], (err, scripts) => {
            if (err) {
              return res.status(500).json({ error: '💔 Database error fetching scripts' });
            }
            
            // Get images
            const imagesQuery = 'SELECT * FROM images WHERE note_id = ? ORDER BY created_at';
            
            db.all(imagesQuery, [noteId], (err, images) => {
              if (err) {
                return res.status(500).json({ error: '💔 Database error fetching images' });
              }
              
              res.json({
                ...note,
                tags,
                solutions: formattedSolutions,
                codeSnippets,
                scripts,
                images
              });
            });
          });
        });
      });
    });
  });
});

// CREATE new note with enhanced fields
app.post('/api/notes', authMiddleware, [
  body('title').notEmpty().withMessage('Title is required'),
  body('problem').optional(),
  body('problem_definition').optional(),
  body('analysis').optional(),
  body('why_solution_a').optional(),
  body('why_switch_to_b').optional(),
  body('category_id').optional().isInt(),
  body('priority').optional().isInt({ min: 1, max: 5 }),
  body('status').optional().isIn(['active', 'completed', 'archived']),
  body('tags').optional().isArray(),
  body('solutions').optional().isArray(),
  body('codeSnippets').optional().isArray(),
  body('scripts').optional().isArray()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title,
    problem,
    problem_definition,
    analysis,
    why_solution_a,
    why_switch_to_b,
    category_id,
    priority = 1,
    status = 'active',
    tags = [],
    solutions = [],
    codeSnippets = [],
    scripts = []
  } = req.body;

  // Insert note
  const noteQuery = `
    INSERT INTO notes (
      title, problem, problem_definition, analysis, why_solution_a, 
      why_switch_to_b, category_id, priority, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(noteQuery, [
    title, problem, problem_definition, analysis, why_solution_a,
    why_switch_to_b, category_id, priority, status
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: '💔 Database error creating note' });
    }

    const noteId = this.lastID;
    
    // Handle tags
    if (tags.length > 0) {
      const tagPromises = tags.map(tagId => {
        return new Promise((resolve, reject) => {
          db.run('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)', [noteId, tagId], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      });
      
      Promise.all(tagPromises).catch(err => {
        console.error('Error adding tags:', err);
      });
    }
    
    // Handle solutions
    if (solutions.length > 0) {
      solutions.forEach((solution, index) => {
        const solutionQuery = `
          INSERT INTO solutions (note_id, plan_type, description, reasoning, priority)
          VALUES (?, ?, ?, ?, ?)
        `;
        
        db.run(solutionQuery, [
          noteId, 
          solution.plan_type || `Plan ${String.fromCharCode(65 + index)}`,
          solution.description,
          solution.reasoning,
          solution.priority || (index + 1)
        ], function(err) {
          if (err) {
            console.error('Error creating solution:', err);
            return;
          }
          
          const solutionId = this.lastID;
          
          // Handle steps for this solution
          if (solution.steps && solution.steps.length > 0) {
            solution.steps.forEach((step, stepIndex) => {
              db.run(
                'INSERT INTO steps (solution_id, step_number, description) VALUES (?, ?, ?)',
                [solutionId, stepIndex + 1, step.description],
                (err) => {
                  if (err) console.error('Error creating step:', err);
                }
              );
            });
          }
        });
      });
    }
    
    // Handle code snippets
    if (codeSnippets.length > 0) {
      codeSnippets.forEach((snippet, index) => {
        db.run(
          'INSERT INTO code_snippets (note_id, title, language, code, description, execution_order) VALUES (?, ?, ?, ?, ?, ?)',
          [noteId, snippet.title, snippet.language, snippet.code, snippet.description, index + 1],
          (err) => {
            if (err) console.error('Error creating code snippet:', err);
          }
        );
      });
    }
    
    // Handle scripts
    if (scripts.length > 0) {
      scripts.forEach((script, index) => {
        db.run(
          'INSERT INTO scripts (note_id, title, script_type, content, description, execution_order) VALUES (?, ?, ?, ?, ?, ?)',
          [noteId, script.title, script.script_type, script.content, script.description, index + 1],
          (err) => {
            if (err) console.error('Error creating script:', err);
          }
        );
      });
    }

    res.json({
      id: noteId,
      message: '💖 Note created successfully for Melo!'
    });
  });
});

// UPDATE note
app.put('/api/notes/:id', authMiddleware, (req, res) => {
  const noteId = req.params.id;
  const updates = req.body;
  
  const updateQuery = `
    UPDATE notes SET 
      title = COALESCE(?, title),
      problem = COALESCE(?, problem),
      problem_definition = COALESCE(?, problem_definition),
      analysis = COALESCE(?, analysis),
      why_solution_a = COALESCE(?, why_solution_a),
      why_switch_to_b = COALESCE(?, why_switch_to_b),
      category_id = COALESCE(?, category_id),
      priority = COALESCE(?, priority),
      status = COALESCE(?, status),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  
  db.run(updateQuery, [
    updates.title, updates.problem, updates.problem_definition, updates.analysis,
    updates.why_solution_a, updates.why_switch_to_b, updates.category_id,
    updates.priority, updates.status, noteId
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: '💔 Database error updating note' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '💔 Note not found' });
    }
    
    res.json({ message: '💖 Note updated successfully for Melo!' });
  });
});

// DELETE note
app.delete('/api/notes/:id', authMiddleware, (req, res) => {
  const noteId = req.params.id;
  
  db.run('DELETE FROM notes WHERE id = ?', [noteId], function(err) {
    if (err) {
      return res.status(500).json({ error: '💔 Database error deleting note' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '💔 Note not found' });
    }
    
    res.json({ message: '💖 Note deleted successfully for Melo!' });
  });
});

// UPDATE step completion
app.put('/api/steps/:id', authMiddleware, [
  body('completed').isBoolean().withMessage('Completed must be a boolean')
], (req, res) => {
  const stepId = req.params.id;
  const { completed } = req.body;
  
  db.run('UPDATE steps SET completed = ? WHERE id = ?', [completed, stepId], function(err) {
    if (err) {
      return res.status(500).json({ error: '💔 Database error updating step' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: '💔 Step not found' });
    }
    
    res.json({ message: '💖 Step updated successfully for Melo!' });
  });
});

// IMAGE UPLOAD endpoint
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '💔 No image file provided' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    message: '💖 Image uploaded successfully for Melo!',
    url: imageUrl,
    filename: req.file.filename
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`💖 MELONOTES Server running on port ${PORT} for my beloved Melo! 💖`);
});
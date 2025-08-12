const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const database = require('./database-couchbase');
const { generateToken, authMiddleware, comparePassword } = require('./auth');

const app = express();
const PORT = process.env.PORT || 5002;

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

// 💖 Welcome message for Melo
app.get('/', (req, res) => {
  res.json({ 
    message: "💝 Welcome to MELONOTES Couchbase API - Made with love for Melo! 💖",
    database: "Couchbase Capella",
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
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    
    // Query for user in Couchbase
    const result = await database.getCluster().query(
      'SELECT * FROM melonotes WHERE type = "user" AND username = $1',
      { parameters: [username] }
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '💔 Invalid credentials' });
    }
    
    const user = result.rows[0].melonotes;
    
    if (!comparePassword(password, user.password)) {
      return res.status(401).json({ error: '💔 Invalid credentials' });
    }
    
    const token = generateToken(user.id, user.username);
    
    res.json({
      message: `💖 Welcome back to MELONOTES Couchbase, ${user.username}! Made with love for Melo! 💖`,
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });
    
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: '💔 Database error' });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({
    message: '💖 Token is valid for Melo with Couchbase!',
    user: {
      id: req.user.userId,
      username: req.user.username
    }
  });
});

// CATEGORIES ENDPOINTS
app.get('/api/categories', authMiddleware, async (req, res) => {
  try {
    const result = await database.getCluster().query(
      'SELECT * FROM melonotes WHERE type = "category" ORDER BY name'
    );
    
    const categories = result.rows.map(row => row.melonotes);
    res.json(categories);
    
  } catch (err) {
    console.error('Categories fetch error:', err);
    res.status(500).json({ error: '💔 Database error fetching categories' });
  }
});

app.post('/api/categories', authMiddleware, [
  body('name').notEmpty().withMessage('Category name is required'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, color = '#FF69B4' } = req.body;
    
    // Check if category already exists
    const existingResult = await database.getCluster().query(
      'SELECT * FROM melonotes WHERE type = "category" AND name = $1',
      { parameters: [name] }
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: '💔 Category already exists' });
    }
    
    // Get next ID
    const countResult = await database.getCluster().query(
      'SELECT COUNT(*) as count FROM melonotes WHERE type = "category"'
    );
    const nextId = countResult.rows[0].count + 1;
    
    const categoryDoc = {
      type: 'category',
      id: nextId,
      name,
      color,
      created_at: new Date().toISOString()
    };
    
    await database.getCollection().upsert(`category::${nextId}`, categoryDoc);
    
    res.json({ 
      id: nextId, 
      name, 
      color,
      message: '💖 Category created successfully for Melo!' 
    });
    
  } catch (err) {
    console.error('Category creation error:', err);
    res.status(500).json({ error: '💔 Database error creating category' });
  }
});

app.put('/api/categories/:id', authMiddleware, [
  body('name').notEmpty().withMessage('Category name is required'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, color } = req.body;
    
    const categoryId = `category::${id}`;
    
    // Get existing category
    const existing = await database.getCollection().get(categoryId);
    
    // Update category
    const updatedCategory = {
      ...existing.content,
      name,
      color,
      updated_at: new Date().toISOString()
    };
    
    await database.getCollection().upsert(categoryId, updatedCategory);
    
    res.json({ message: '💖 Category updated successfully for Melo!' });
    
  } catch (err) {
    if (err.code === 13) { // Document not found
      return res.status(404).json({ error: '💔 Category not found' });
    }
    console.error('Category update error:', err);
    res.status(500).json({ error: '💔 Database error updating category' });
  }
});

app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const categoryId = `category::${id}`;
    
    await database.getCollection().remove(categoryId);
    res.json({ message: '💖 Category deleted successfully for Melo!' });
    
  } catch (err) {
    if (err.code === 13) { // Document not found
      return res.status(404).json({ error: '💔 Category not found' });
    }
    console.error('Category deletion error:', err);
    res.status(500).json({ error: '💔 Database error deleting category' });
  }
});

// TAGS ENDPOINTS
app.get('/api/tags', authMiddleware, async (req, res) => {
  try {
    const result = await database.getCluster().query(
      'SELECT * FROM melonotes WHERE type = "tag" ORDER BY name'
    );
    
    const tags = result.rows.map(row => row.melonotes);
    res.json(tags);
    
  } catch (err) {
    console.error('Tags fetch error:', err);
    res.status(500).json({ error: '💔 Database error fetching tags' });
  }
});

app.post('/api/tags', authMiddleware, [
  body('name').notEmpty().withMessage('Tag name is required'),
  body('color').optional().isHexColor().withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, color = '#FF69B4' } = req.body;
    
    // Check if tag already exists
    const existingResult = await database.getCluster().query(
      'SELECT * FROM melonotes WHERE type = "tag" AND name = $1',
      { parameters: [name] }
    );
    
    if (existingResult.rows.length > 0) {
      return res.status(409).json({ error: '💔 Tag already exists' });
    }
    
    // Get next ID
    const countResult = await database.getCluster().query(
      'SELECT COUNT(*) as count FROM melonotes WHERE type = "tag"'
    );
    const nextId = countResult.rows[0].count + 1;
    
    const tagDoc = {
      type: 'tag',
      id: nextId,
      name,
      color,
      created_at: new Date().toISOString()
    };
    
    await database.getCollection().upsert(`tag::${nextId}`, tagDoc);
    
    res.json({ 
      id: nextId, 
      name, 
      color,
      message: '💖 Tag created successfully for Melo!' 
    });
    
  } catch (err) {
    console.error('Tag creation error:', err);
    res.status(500).json({ error: '💔 Database error creating tag' });
  }
});

app.delete('/api/tags/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const tagId = `tag::${id}`;
    
    await database.getCollection().remove(tagId);
    res.json({ message: '💖 Tag deleted successfully for Melo!' });
    
  } catch (err) {
    if (err.code === 13) { // Document not found
      return res.status(404).json({ error: '💔 Tag not found' });
    }
    console.error('Tag deletion error:', err);
    res.status(500).json({ error: '💔 Database error deleting tag' });
  }
});

// GET all notes with enhanced data including tags
app.get('/api/notes', authMiddleware, async (req, res) => {
  try {
    const { search, category, tags, status } = req.query;
    
    let sql = 'SELECT * FROM melonotes WHERE type = "note"';
    const conditions = [];
    const parameters = [];
    let paramIndex = 1;
    
    if (search) {
      conditions.push(`(title LIKE $${paramIndex} OR problem LIKE $${paramIndex + 1} OR analysis LIKE $${paramIndex + 2} OR problem_definition LIKE $${paramIndex + 3})`);
      parameters.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 4;
    }
    
    if (category) {
      conditions.push(`category_id = $${paramIndex}`);
      parameters.push(parseInt(category));
      paramIndex++;
    }
    
    if (status) {
      conditions.push(`status = $${paramIndex}`);
      parameters.push(status);
      paramIndex++;
    }
    
    if (conditions.length > 0) {
      sql += ' AND ' + conditions.join(' AND ');
    }
    
    sql += ' ORDER BY updated_at DESC';
    
    const result = await database.getCluster().query(sql, {
      parameters: parameters
    });
    
    const notes = result.rows.map(row => row.melonotes);
    
    // Get categories and tags for each note
    const enrichedNotes = await Promise.all(notes.map(async (note) => {
      // Get category
      let category = null;
      if (note.category_id) {
        try {
          const categoryResult = await database.getCollection().get(`category::${note.category_id}`);
          category = {
            name: categoryResult.content.name,
            color: categoryResult.content.color
          };
        } catch (err) {
          // Category might not exist
        }
      }
      
      // Get tags
      let noteTags = [];
      if (note.tags && Array.isArray(note.tags)) {
        noteTags = await Promise.all(note.tags.map(async (tagId) => {
          try {
            const tagResult = await database.getCollection().get(`tag::${tagId}`);
            return tagResult.content;
          } catch (err) {
            return null;
          }
        }));
        noteTags = noteTags.filter(tag => tag !== null);
      }
      
      return {
        ...note,
        category_name: category?.name,
        category_color: category?.color,
        tags: noteTags
      };
    }));
    
    res.json(enrichedNotes);
    
  } catch (err) {
    console.error('Notes fetch error:', err);
    res.status(500).json({ error: '💔 Database error fetching notes' });
  }
});

// GET single note with all related data
app.get('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    const noteId = req.params.id;
    
    // Get note
    const noteResult = await database.getCollection().get(`note::${noteId}`);
    const note = noteResult.content;
    
    // Get category
    let category = null;
    if (note.category_id) {
      try {
        const categoryResult = await database.getCollection().get(`category::${note.category_id}`);
        category = {
          name: categoryResult.content.name,
          color: categoryResult.content.color
        };
      } catch (err) {
        // Category might not exist
      }
    }
    
    // Get tags
    let tags = [];
    if (note.tags && Array.isArray(note.tags)) {
      tags = await Promise.all(note.tags.map(async (tagId) => {
        try {
          const tagResult = await database.getCollection().get(`tag::${tagId}`);
          return tagResult.content;
        } catch (err) {
          return null;
        }
      }));
      tags = tags.filter(tag => tag !== null);
    }
    
    // Get solutions
    const solutionsResult = await database.getCluster().query(
      'SELECT * FROM melonotes WHERE type = "solution" AND note_id = $1 ORDER BY priority',
      { parameters: [parseInt(noteId)] }
    );
    
    const solutions = await Promise.all(solutionsResult.rows.map(async (row) => {
      const solution = row.melonotes;
      
      // Get steps for this solution
      const stepsResult = await database.getCluster().query(
        'SELECT * FROM melonotes WHERE type = "step" AND solution_id = $1 ORDER BY step_number',
        { parameters: [solution.id] }
      );
      
      const steps = stepsResult.rows.map(stepRow => stepRow.melonotes);
      
      return {
        ...solution,
        steps
      };
    }));
    
    // Get code snippets
    const codeResult = await database.getCluster().query(
      'SELECT * FROM melonotes WHERE type = "code_snippet" AND note_id = $1 ORDER BY execution_order',
      { parameters: [parseInt(noteId)] }
    );
    
    const codeSnippets = codeResult.rows.map(row => row.melonotes);
    
    // Get scripts
    const scriptsResult = await database.getCluster().query(
      'SELECT * FROM melonotes WHERE type = "script" AND note_id = $1 ORDER BY execution_order',
      { parameters: [parseInt(noteId)] }
    );
    
    const scripts = scriptsResult.rows.map(row => row.melonotes);
    
    res.json({
      ...note,
      category_name: category?.name,
      category_color: category?.color,
      tags,
      solutions,
      codeSnippets,
      scripts,
      images: [] // TODO: Implement images if needed
    });
    
  } catch (err) {
    if (err.code === 13) { // Document not found
      return res.status(404).json({ error: '💔 Note not found' });
    }
    console.error('Note fetch error:', err);
    res.status(500).json({ error: '💔 Database error fetching note' });
  }
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
], async (req, res) => {
  try {
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

    // Get next note ID
    const countResult = await database.getCluster().query(
      'SELECT COUNT(*) as count FROM melonotes WHERE type = "note"'
    );
    const noteId = countResult.rows[0].count + 1;

    // Create note document
    const noteDoc = {
      type: 'note',
      id: noteId,
      title,
      problem,
      problem_definition,
      analysis,
      why_solution_a,
      why_switch_to_b,
      category_id,
      priority,
      status,
      tags,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await database.getCollection().upsert(`note::${noteId}`, noteDoc);
    
    // Handle solutions
    if (solutions.length > 0) {
      await Promise.all(solutions.map(async (solution, index) => {
        const solutionCountResult = await database.getCluster().query(
          'SELECT COUNT(*) as count FROM melonotes WHERE type = "solution"'
        );
        const solutionId = solutionCountResult.rows[0].count + index + 1;
        
        const solutionDoc = {
          type: 'solution',
          id: solutionId,
          note_id: noteId,
          plan_type: solution.plan_type || `Plan ${String.fromCharCode(65 + index)}`,
          description: solution.description,
          reasoning: solution.reasoning,
          priority: solution.priority || (index + 1),
          created_at: new Date().toISOString()
        };
        
        await database.getCollection().upsert(`solution::${solutionId}`, solutionDoc);
        
        // Handle steps for this solution
        if (solution.steps && solution.steps.length > 0) {
          await Promise.all(solution.steps.map(async (step, stepIndex) => {
            const stepCountResult = await database.getCluster().query(
              'SELECT COUNT(*) as count FROM melonotes WHERE type = "step"'
            );
            const stepId = stepCountResult.rows[0].count + stepIndex + 1;
            
            const stepDoc = {
              type: 'step',
              id: stepId,
              solution_id: solutionId,
              step_number: stepIndex + 1,
              description: step.description,
              completed: false,
              created_at: new Date().toISOString()
            };
            
            await database.getCollection().upsert(`step::${stepId}`, stepDoc);
          }));
        }
      }));
    }
    
    // Handle code snippets
    if (codeSnippets.length > 0) {
      await Promise.all(codeSnippets.map(async (snippet, index) => {
        const codeCountResult = await database.getCluster().query(
          'SELECT COUNT(*) as count FROM melonotes WHERE type = "code_snippet"'
        );
        const codeId = codeCountResult.rows[0].count + index + 1;
        
        const codeDoc = {
          type: 'code_snippet',
          id: codeId,
          note_id: noteId,
          title: snippet.title,
          language: snippet.language,
          code: snippet.code,
          description: snippet.description,
          execution_order: index + 1,
          created_at: new Date().toISOString()
        };
        
        await database.getCollection().upsert(`code::${codeId}`, codeDoc);
      }));
    }
    
    // Handle scripts
    if (scripts.length > 0) {
      await Promise.all(scripts.map(async (script, index) => {
        const scriptCountResult = await database.getCluster().query(
          'SELECT COUNT(*) as count FROM melonotes WHERE type = "script"'
        );
        const scriptId = scriptCountResult.rows[0].count + index + 1;
        
        const scriptDoc = {
          type: 'script',
          id: scriptId,
          note_id: noteId,
          title: script.title,
          script_type: script.script_type,
          content: script.content,
          description: script.description,
          execution_order: index + 1,
          created_at: new Date().toISOString()
        };
        
        await database.getCollection().upsert(`script::${scriptId}`, scriptDoc);
      }));
    }

    res.json({
      id: noteId,
      message: '💖 Note created successfully for Melo with Couchbase!'
    });
    
  } catch (err) {
    console.error('Note creation error:', err);
    res.status(500).json({ error: '💔 Database error creating note' });
  }
});

// UPDATE note
app.put('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    const noteId = req.params.id;
    const updates = req.body;
    
    // Get existing note
    const existing = await database.getCollection().get(`note::${noteId}`);
    
    // Update note
    const updatedNote = {
      ...existing.content,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    await database.getCollection().upsert(`note::${noteId}`, updatedNote);
    
    res.json({ message: '💖 Note updated successfully for Melo with Couchbase!' });
    
  } catch (err) {
    if (err.code === 13) { // Document not found
      return res.status(404).json({ error: '💔 Note not found' });
    }
    console.error('Note update error:', err);
    res.status(500).json({ error: '💔 Database error updating note' });
  }
});

// DELETE note
app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    const noteId = req.params.id;
    
    // Delete note and all related documents
    await database.getCollection().remove(`note::${noteId}`);
    
    // Delete related solutions, steps, code snippets, and scripts
    const relatedTypes = ['solution', 'step', 'code_snippet', 'script'];
    
    for (const type of relatedTypes) {
      const result = await database.getCluster().query(
        `SELECT META().id FROM melonotes WHERE type = "${type}" AND note_id = $1`,
        { parameters: [parseInt(noteId)] }
      );
      
      await Promise.all(result.rows.map(async (row) => {
        await database.getCollection().remove(row.id);
      }));
    }
    
    res.json({ message: '💖 Note deleted successfully for Melo with Couchbase!' });
    
  } catch (err) {
    if (err.code === 13) { // Document not found
      return res.status(404).json({ error: '💔 Note not found' });
    }
    console.error('Note deletion error:', err);
    res.status(500).json({ error: '💔 Database error deleting note' });
  }
});

// UPDATE step completion
app.put('/api/steps/:id', authMiddleware, [
  body('completed').isBoolean().withMessage('Completed must be a boolean')
], async (req, res) => {
  try {
    const stepId = req.params.id;
    const { completed } = req.body;
    
    // Get existing step
    const existing = await database.getCollection().get(`step::${stepId}`);
    
    // Update step
    const updatedStep = {
      ...existing.content,
      completed,
      updated_at: new Date().toISOString()
    };
    
    await database.getCollection().upsert(`step::${stepId}`, updatedStep);
    
    res.json({ message: '💖 Step updated successfully for Melo with Couchbase!' });
    
  } catch (err) {
    if (err.code === 13) { // Document not found
      return res.status(404).json({ error: '💔 Step not found' });
    }
    console.error('Step update error:', err);
    res.status(500).json({ error: '💔 Database error updating step' });
  }
});

// IMAGE UPLOAD endpoint (unchanged)
app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '💔 No image file provided' });
  }

  const imageUrl = `/uploads/${req.file.filename}`;
  
  res.json({
    message: '💖 Image uploaded successfully for Melo with Couchbase!',
    url: imageUrl,
    filename: req.file.filename
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`💖 MELONOTES Couchbase Server running on port ${PORT} for my beloved Melo! 💖`);
});
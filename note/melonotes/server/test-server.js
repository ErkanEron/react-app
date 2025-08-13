const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 8081;

app.use(cors());
app.use(express.json());

// Basit in-memory users
const users = [
  {
    id: 1,
    username: 'melo',
    password: bcrypt.hashSync('password', 10)
  },
  {
    id: 2,
    username: 'frieren', 
    password: bcrypt.hashSync('MeldaErkan!5352', 10)
  }
];

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: "💝 Welcome to MELONOTES Test API - Made with love for Melo! 💖",
    database: "In-Memory",
    status: "Working"
  });
});

// LOGIN endpoint
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password });
  
  const user = users.find(u => u.username === username);
  
  if (!user) {
    console.log('User not found');
    return res.status(401).json({ error: '💔 Invalid credentials' });
  }
  
  if (!bcrypt.compareSync(password, user.password)) {
    console.log('Invalid password');
    return res.status(401).json({ error: '💔 Invalid credentials' });
  }
  
  console.log('Login successful');
  
  res.json({
    message: `💖 Welcome back to MELONOTES Test, ${user.username}! Made with love for Melo! 💖`,
    token: 'test-token-' + Date.now(),
    user: {
      id: user.id,
      username: user.username
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`💖 MELONOTES Test Server running on port ${PORT} for my beloved Melo! 💖`);
});
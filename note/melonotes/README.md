# 💝 MELONOTES - Made with Love for Melo 💖

A beautiful, feature-rich note-taking application specifically designed for database professionals and anyone who needs to organize complex technical information. Built with love for Melo! 🎀

![Frieren & Fern](client/src/frieren-logo.png)

## ✨ Features

- 📝 **Rich Note Creation**: Create detailed notes with problem descriptions, analysis, and multiple solution plans
- 🎯 **Multiple Solution Tracking**: Plan A, Plan B, Plan C... as many solutions as needed!
- ✅ **Step-by-Step Progress**: Break down solutions into trackable steps with completion status
- 💻 **Code Highlighting**: Syntax highlighting for SQL, JavaScript, Python, and more
- 📷 **Image Support**: Upload screenshots and diagrams
- 🏷️ **Smart Categories**: Organize notes by Database Issues, Performance, SQL Queries, etc.
- 🔍 **Powerful Search**: Find notes quickly by title, problem, or analysis
- 💖 **Beautiful UI**: Pink gradient theme with Frieren & Fern artwork
- 📱 **Responsive Design**: Works perfectly on desktop and mobile

## 🛠️ Tech Stack

### Backend
- **Node.js + Express**: RESTful API server
- **SQLite3**: Lightweight, file-based database
- **Multer**: File upload handling
- **CORS**: Cross-origin resource sharing

### Frontend
- **React + TypeScript**: Modern frontend framework
- **Lucide React**: Beautiful icon library
- **React Syntax Highlighter**: Code syntax highlighting
- **Axios**: HTTP client for API calls

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd melonotes
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd ../server
   npm run dev
   ```

5. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm start
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The API runs on `http://localhost:5000`

## 📁 Project Structure

```
melonotes/
├── server/                 # Backend API
│   ├── server.js          # Express server
│   ├── database.js        # SQLite database setup
│   ├── melonotes.db       # SQLite database file
│   └── package.json       # Server dependencies
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Main App component
│   └── package.json       # Client dependencies
├── uploads/               # Uploaded images
└── netlify.toml          # Deployment configuration
```

## 💾 Database Schema

- **categories**: Note categories (Database Issues, Performance, etc.)
- **notes**: Main note entries with title, problem, analysis
- **solutions**: Multiple solution plans per note
- **steps**: Step-by-step breakdown for each solution
- **code_snippets**: Code blocks with syntax highlighting
- **images**: Uploaded screenshots and diagrams

## 🌐 Deployment

This project is configured for easy deployment on Netlify:

1. **Push to GitHub**
2. **Connect to Netlify**
3. **Deploy automatically** with the included `netlify.toml` configuration

The backend can be deployed to platforms like Heroku, Railway, or Render.

## 🎨 UI Features

- **Animated Hearts**: Cute heart animations throughout the interface
- **Pink Gradient Theme**: Beautiful pink/rose color scheme
- **Frieren Logo**: Featuring artwork from the beloved anime
- **Smooth Animations**: Hover effects and transitions
- **Responsive Layout**: Mobile-friendly design

## 📝 Usage Examples

### Creating a Note
1. Click "New Note" button
2. Enter a descriptive title
3. Describe the problem you're facing
4. Add your analysis
5. Create multiple solution plans (Plan A, B, C...)
6. Break down each plan into actionable steps
7. Add code snippets with syntax highlighting
8. Upload relevant screenshots

### Managing Solutions
- Track progress with step completion checkboxes
- Compare different approaches side-by-side
- Update and modify plans as needed

### Code Snippets
Supports syntax highlighting for:
- SQL
- JavaScript
- Python
- Bash
- JSON
- XML

## 💖 Made with Love

This application was crafted with endless love and attention to detail for Melo, featuring:
- Custom Frieren & Fern artwork
- Pink heart favicon
- Love-filled messages throughout the interface
- Smooth, delightful user experience

## 🤝 Contributing

This is a personal project made specifically for Melo, but if you'd like to suggest improvements or report issues, feel free to reach out!

## 📄 License

This project is made with love for Melo. Please use responsibly! 💖

---

*"The best notes are written with love and organized with care."* - Made for Melo 💝
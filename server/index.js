/**
 * ============================================================
 *  CodarchV4 — Server Entrypoint
 * ============================================================
 *
 *  This file boots the Express application that powers the
 *  CodeArchive REST API.
 *
 *  Startup sequence:
 *    1. Load environment variables.
 *    2. Create Express app & middleware.
 *    3. Connect successfully to MongoDB via Mongoose.
 *    4. Mount API routes.
 *    5. Start listening on PORT.
 * ============================================================
 */

const express  = require('express');
const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const cors     = require('cors');

// 1. Setup App & Config
const app = express();
dotenv.config({ path: './.env' });
const PORT = process.env.PORT || 3001;


// 2. Middleware
// CORS: Allow specific origins (or default to Vite dev server)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

if (allowedOrigins.length > 0) {
  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
}

app.use(express.json()); // Parse JSON bodies

// 3. Database Connection
// We MUST use mongoose.connect() because our models (Snippets.js) use Mongoose.
// The native MongoClient code (from Atlas tutorials) does NOT connect Mongoose.
(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required in .env');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected via Mongoose');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
})();

// 4. Routes
// Mount routers BEFORE error handlers
const snippetsRouter = require('./routes/snippetsRouter');
app.use('/api/snippets', snippetsRouter);

// 404 Handler
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(err.status || 500).json({
    error: 'Server Error',
    detail: err.message
  });
});

// 5. Start Server
app.listen(PORT, "0.0.0.0", () => console.log(`API on ${PORT}`));

module.exports = app;

/**
 * ============================================================
 *  CodarchV4 — Server Entrypoint
 * ============================================================
 *
 *  This file boots the Express application that powers the
 *  CodeArchive REST API, a service for storing and retrieving
 *  reusable code snippets.
 *
 *  Startup sequence:
 *    1. Load environment variables from .env (via dotenv).
 *    2. Create the Express app and register global middleware.
 *    3. Connect to MongoDB Atlas through Mongoose (single
 *       shared connection pool — stays open for the lifetime
 *       of the process).
 *    4. Mount API routers under the /api namespace.
 *    5. Register 404 & centralized error-handling middleware.
 *    6. Bind to PORT and begin accepting HTTP requests.
 *
 *  Key exports:
 *    • app  — The Express instance (useful for testing or
 *             embedding in a larger server).
 *
 *  Environment variables (see .env):
 *    • MONGODB_URI      — Full MongoDB connection string (REQUIRED).
 *    • PORT             — HTTP port (default 3000).
 *    • ALLOWED_ORIGINS  — Comma-separated list of CORS origins
 *                         (default http://localhost:5173).
 * ============================================================
 */

// ──────────────────────────────────────────────────────────────
//  Dependencies
// ──────────────────────────────────────────────────────────────
const express  = require('express');   // Core web framework (v5)
const mongoose = require('mongoose');  // ODM for MongoDB — manages schemas, queries, connection pooling
const dotenv   = require('dotenv');    // Reads .env into process.env
const cors     = require('cors');      // Cross-Origin Resource Sharing middleware

// ──────────────────────────────────────────────────────────────
//  Bootstrap
// ──────────────────────────────────────────────────────────────

const app = express();

// Load .env BEFORE any code reads process.env
dotenv.config({ path: './.env' });

// Fallback port if not set in environment
const PORT = process.env.PORT || 3000;

// ──────────────────────────────────────────────────────────────
//  CORS — restrict which front-end origins may call this API
// ──────────────────────────────────────────────────────────────
//  The ALLOWED_ORIGINS env var is a comma-separated string.
//  Example: "http://localhost:5173,https://codarch.example.com"
//  If omitted, only http://localhost:5173 (Vite dev server) is
//  allowed by default.
// ──────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);  // Drop empty strings produced by trailing commas

if (allowedOrigins.length > 0) {
  app.use(cors({
    origin: allowedOrigins,                 // Only these origins may call the API
    methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Allowed HTTP verbs
    credentials: true                       // Allow cookies / Authorization headers
  }));
}

// ──────────────────────────────────────────────────────────────
//  Global Middleware
// ──────────────────────────────────────────────────────────────
//  express.json() parses incoming request bodies with
//  Content-Type: application/json and exposes the result
//  on req.body. Without this, req.body would be undefined
//  for POST/PUT requests.
// ──────────────────────────────────────────────────────────────
app.use(express.json());

// ──────────────────────────────────────────────────────────────
//  Mongoose Connection (runs once at startup)
// ──────────────────────────────────────────────────────────────
//  Mongoose maintains a single connection pool internally.
//  Once connected here, every model query in the app reuses
//  this pool — no need to pass a db handle around.
//
//  If MONGODB_URI is missing we throw immediately so the
//  process exits with a clear message instead of silently
//  failing on the first request.
// ──────────────────────────────────────────────────────────────
(async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is required — set it in server/.env or your environment'
    );
  }

  
  const { MongoClient, ServerApiVersion } = require('mongodb');
  const uri = process.env.MONGODB_URI;

  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);

// ──────────────────────────────────────────────────────────────
//  API Routes
// ──────────────────────────────────────────────────────────────
//  Rule of thumb: mount all routers BEFORE the 404 and error
//  middleware so that valid routes are matched first.
//
//  To add a new resource (e.g., Users), create a router in
//  ./routes/usersRouter.js, then mount it here:
//    const usersRouter = require('./routes/usersRouter');
//    app.use('/api/users', usersRouter);
// ──────────────────────────────────────────────────────────────
const snippetsRouter = require('./routes/snippetsRouter');
app.use('/api/snippets', snippetsRouter);

// ──────────────────────────────────────────────────────────────
//  404 Handler — catches any request that didn't match a route
// ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ──────────────────────────────────────────────────────────────
//  Centralized Error Handler
// ──────────────────────────────────────────────────────────────
//  Express recognises this as an error middleware because it
//  has exactly four parameters (err, req, res, next).
//  Any call to next(err) inside a route handler will land here.
//
//  NOTE: In production you should avoid leaking err.message to
//  the client — it may contain stack traces or sensitive info.
// ──────────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('🔥 Error handler:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: 'Server Error',
    detail: err.message
  });
});

// ──────────────────────────────────────────────────────────────
//  Launch the Server
// ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 CodeArchive API listening on http://localhost:${PORT}`);
});

// Export for integration tests or programmatic embedding
module.exports = app;})

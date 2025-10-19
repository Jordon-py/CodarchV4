/**
 * Server entrypoint for the CodeArchive API.
 *
 * Responsibilities:
 * - Boot Express, parse JSON, wire routers.
 * - Connect to MongoDB via Mongoose for all models.
 * - Centralize error handling and 404 handling.
 *
 * Key exports/variables:
 * - app: The Express application instance (used by tests or other launchers).
 * - PORT: The HTTP port the server listens on (default 3000).
 *
 * How it fits together:
 * - Mongoose connects once on startup and stays alive for request handling.
 * - Routers mounted under /api (e.g., /api/snippets).
 * - Errors funnel to the final error middleware for consistent JSON output.
 */
const snippetRouter = require('./routes/snippetsRouter'); //--------- Router for /api/snippets
const mongoose = require('mongoose');                   // ----------ODM for MongoDB
const express = require('express');                     //----------- Core web framework
const dotenv = require('dotenv');
const cors = require('cors');


const app = express();
dotenv.config({path: './.env'});
const PORT = process.env.PORT || 3000;


//  -----------------------
//  MONGO_DB_CONNECTION
//  -------------------------

const {MongoClient, ServerApiVersion} = require('mongodb');
const uri = process.env.MONGODB_URI || null;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();                             // Connect the client to the server	(optional starting in v4.7)
    await client.db("admin").command({ping: 1});        // Send a ping to confirm a successful connection
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    await client.close();                               // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);




// --------------------------------------------------------------//
// ALLOWED_ORIGINS ------------------------------//----------------//
// --------------------------------------------------------------//
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(',').map(origin => origin.trim()).filter(origin => origin);
if (allowedOrigins.length > 0) {
  app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
}


// ---------------------- Global middleware ----------------------//
app.use(express.json());                        // ------------------ Parse JSON bodies on all routes
// --------------------------------------------------------------//





//  -----------------------------------------------------------------------------------//
//---------------- Mongoose connection (once on startup) ----------------//
// --------------------------------------------------------------//

(async () => {
  if (!process.env.MONGODB_URI) {                       // Fail fast if DB URI missing; prevents running in a bad config
    throw new Error('MONGODB_URI is required (set it in your environment)');
  }
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codearchive');      // Single shared connection
  console.log('MongoDB connected');                     // Basic startup signal for observability
})
  ().catch(err => {
    console.error('Startup error:', err.message);         // Log with a clear prefix
    process.exit(1);                                      // Exit to avoid half-alive server
  });



//  --------------------------------------------------------------//
//------------------- API routes -------------------//
// --------------------------------------------------------------//

// Mount API routers  // Rule of thumb: mount routers before 404 and error handlers
const snippetsRouter = require('./routes/snippetsRouter');
app.use('/api/snippets', snippetsRouter);
// Add more routers here as you create them (e.g., usersRouter)



//  --------------------------------------------------------------//
//---------------- 404 and Error Handlers ----------------//
// --------------------------------------------------------------//
app.use((req, res) => res.status(404).json({error: 'Not found'}));



// Catches errors from routers and middleware
app.use((err, _req, res, _next) => {
  console.error('Error handler:', err);                 // Keep raw error for logs
  const status = err.status || 500;                     // Default to 500
  res.status(status).json({error: 'Server Error', detail: err.message});
  // Tip: avoid leaking stack traces to clients in production
});


// --------------------------------------------------------------//
// ---------------------- Launch the server ----------------------//
// --------------------------------------------------------------//

app.listen(PORT, (req, res) => {                                // Bind to port
  console.log(`CodeArchive API listening on http://localhost:${PORT}`);
});

module.exports = app;                                   // Export for tests or external launchers

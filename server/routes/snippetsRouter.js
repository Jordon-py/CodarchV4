/**
 * Snippets Router
 *
 * Responsibilities:
 * - CRUD endpoints for Snippet documents.
 * - Validates inputs at the Mongoose layer; can add request validation here if needed.
 *
 * Endpoints:
 * - GET    /           → list (with basic pagination)
 * - GET    /:id        → read one by id
 * - POST   /           → create one
 * - PUT    /:id        → update by id (validators on, returns new doc)
 * - DELETE /:id        → delete by id
 *
 * Notes:
 * - Uses Mongoose model methods (create, find, findById, findByIdAndUpdate, findByIdAndDelete).
 * - All handlers use try/catch and delegate to next(err) for centralized error handling.
 */

const express = require('express');                     // Router from Express
const router = express.Router();                        // Dedicated router instance
const Snippet = require('../models/Snippets.js');          // Mongoose model (default export)

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /api/snippets?skip=0&limit=20
router.get('/', async (req, res, next) => {
  try {
    const skip = Math.max(parseInt(req.query.skip || '0', 10), 0); // Simple pagination
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const [items, total] = await Promise.all([
      Snippet.find().sort({createdAt: -1}).skip(skip).limit(limit),
      Snippet.countDocuments()
    ]);
    res.json({total, skip, limit, items});            // Consistent list shape
  } catch (err) {next(err);}                          // Centralized error path
});

// GET /api/snippets/:id
router.get('/:id', async (req, res, next) => {
  try {
    const doc = await Snippet.findById(req.params.id);  // Removed populate until author is a proper ObjectId ref
    if (!doc) return res.status(404).json({error: 'Snippet not found'});
    res.json(doc);                                      // Return full document
  } catch (err) {next(err);}                          // Handles cast errors etc.
});

// POST /api/snippets
router.post('/', async (req, res, next) => {
  try {
    // Expect { title, code, language, author, version } by schema defaults
    const created = await Snippet.create(req.body);     // Validates via schema
    return res.status(201).json(created);                      // 201 for created
  } catch (err) {next(err);}                          // Validation errors bubble to handler
});

// PUT /api/snippets/:id
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await Snippet.findByIdAndUpdate(
      req.params.id,
      req.body,
      {new: true, runValidators: true}                // Return updated doc and enforce validators
    );
    if (!updated) return res.status(404).json({error: 'Snippet not found'});
    res.json(updated);                                  // Send the updated resource
  } catch (err) {next(err);}                          // Central handler formats errors
});

// DELETE /api/snippets/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const removed = await Snippet.findByIdAndDelete(req.params.id); // Atomic remove by id
    if (!removed) return res.status(404).json({error: 'Snippet not found'});
    res.status(204).send();                             // No content; deletion succeeded
  } catch (err) {next(err);}                          // Keep handlers uniform
});

module.exports = router;                                // Export router for index.js to mount

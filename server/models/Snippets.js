/**
 * Snippet Model
 *
 * Purpose:
 * - Store a code snippet with metadata for language, versioning, and authorship.
 *
 * Fields:
 * - title: short human name, indexed for quick search.
 * - version: numeric revision (app-level policy decides how to increment).
 * - code: the source text of the snippet.
 * - language: constrained to a known set for filtering.
 * - author: reference to a User document (required).
 *
 * Notes:
 * - Use minlength/maxlength for strings (not min/max).
 * - Add compound indexes later (e.g., { author: 1, createdAt: -1 }) for dashboards.
 */

const mongoose = require('mongoose');                   // ODM
const {Schema} = mongoose;                            // Build schema definitions

const snippetSchema = new Schema(
  { title: {
      type: String,
      required: true,
      trim: true,
      minlength: 4,
      maxlength: 40,
      index: true                                       // Speeds title searches
    },
    version: {
      type: Number,
      min: 1,
      max: 999,                                         // Room for many revisions
      default: 1
    },
    code: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 5000                                  // Allow sizeable code blocks
    },
    language: {
      type: String,
      required: true,
      trim: true,
      enum: ['JavaScript', 'Python', 'HTML', 'CSS', 'Markdown']
    },
    author: {
      type: String,
      ref: 'User',
      required: false                                   // Changed to String for now, until User model exists
    }
  },
  { timestamps: true }                                   // createdAt, updatedAt
);

// Helpful index for common list views (author’s recent snippets)
snippetSchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Snippet', snippetSchema); // Export compiled model

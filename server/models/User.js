/**
 * User Model
 *
 * Purpose:
 * - Represents an account that owns or collaborates on snippets.
 *
 * Fields:
 * - username: unique handle for display and mentions.
 * - email: unique contact identifier.
 * - password: hashed secret (store only hashes, never plaintext).
 *
 * Notes:
 * - Add pre-save hooks for hashing (bcrypt) and methods for verification when you introduce auth.
 * - Indexes enforce uniqueness; handle duplicate key errors in controllers or error middleware.
 */

const mongoose = require('mongoose');                   // ODM
const { Schema } = mongoose;                            // Schema constructor

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,                                   // Normalize for lookups
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format']  // Basic pattern guard
    },
    password: {
      type: String,
      required: true,
      minlength: 8                                       // Store HASHES, not raw passwords
    }
  },
  { timestamps: true }                                   // createdAt, updatedAt
);

// Example placeholder for future auth hardening:
// userSchema.pre('save', async function () { /* hash password here */ });

module.exports = mongoose.model('User', userSchema);     // Export compiled model

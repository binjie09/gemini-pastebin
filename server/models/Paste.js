const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const pasteSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: () => nanoid(6), // Short ID
    },
    content: {
        type: String,
        required: function () { return !this.filename; } // Content required if not a file upload
    },
    language: {
        type: String,
        default: 'text'
    },
    filename: { // Original filename if uploaded
        type: String
    },
    filepath: { // Path on server if file upload
        type: String
    },
    mimetype: {
        type: String
    },
    expiresAt: {
        type: Date,
        default: null
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    password: {
        type: String, // Hashed password if private (future feature)
    }
}, { timestamps: true });

// Auto-delete expired documents
pasteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Paste', pasteSchema);

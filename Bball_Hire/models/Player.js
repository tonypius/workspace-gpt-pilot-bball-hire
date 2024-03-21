const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  height: { type: Number, required: true },
  GPA: { type: Number, required: true },
  age: { type: Number, required: true },
  highlightVideoLink: { type: String, required: false },
  academicTranscripts: { type: String, required: false }, // This will store the file path
  contactInformation: { type: String, required: true },
});

playerSchema.pre('save', async function(next) {
  try {
    // Example for validation or modification before saving, if needed
    if (this.isModified('GPA') && this.GPA < 0) {
      throw new Error('GPA cannot be negative');
    }
    next();
  } catch (error) {
    console.error('Error in pre-save middleware for Player:', error.message);
    console.error(error.stack);
    next(error);
  }
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;
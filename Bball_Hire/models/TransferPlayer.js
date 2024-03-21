const mongoose = require('mongoose');

const transferPlayerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  height: { type: Number, required: true },
  GPA: { type: Number, required: true },
  age: { type: Number, required: true },
  highlightVideoLink: { type: String },
  academicTranscripts: { type: String }, // This will store the file path
  contactInformation: { type: String, required: true },
  previousCollegeExperience: { type: String, required: true },
  reasonsForTransfer: { type: String, required: true },
});

transferPlayerSchema.pre('save', async function(next) {
  try {
    // Example for validation or modification before saving, if needed
    if (this.isModified('GPA') && this.GPA < 0) {
      throw new Error('GPA cannot be negative');
    }
    console.log(`Saving transfer player profile: ${this.name}`);
    next();
  } catch (error) {
    console.error('Error in pre-save middleware for TransferPlayer:', error.message);
    console.error(error.stack);
    next(error);
  }
});

const TransferPlayer = mongoose.model('TransferPlayer', transferPlayerSchema);

module.exports = TransferPlayer;
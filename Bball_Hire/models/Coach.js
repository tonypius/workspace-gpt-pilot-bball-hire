const mongoose = require('mongoose');

const coachSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coachingExperience: { type: String, required: true },
  teamInformation: { type: String, required: true },
  contactDetails: { type: String, required: true },
});

coachSchema.pre('save', function(next) {
  // Example of a simple logging before saving a coach
  console.log(`Saving coach: ${this.name}`);
  next();
});

coachSchema.post('save', function(doc, next) {
  console.log(`Coach ${doc.name} was saved successfully.`);
  next();
});

coachSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error(`Error saving coach ${doc ? doc.name : ''}:`, error);
    next(error);
  } else {
    next();
  }
});

const Coach = mongoose.model('Coach', coachSchema);

module.exports = Coach;
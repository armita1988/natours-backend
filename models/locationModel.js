const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ['Point'],
        message: 'the only valid value is "point"',
      },
      default: 'Point',
    },
    coordinates: { type: [Number], required: true },
    address: String,
    description: String,
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
    toObject: { virtuals: true, versionKey: false },
  },
);
// const Location = mongoose.model('Location', locationSchema);

module.exports = { locationSchema };

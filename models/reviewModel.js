const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review can not be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Review must have a rating'],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user'],
    },
    booking: {
      type: mongoose.Schema.ObjectId,
      ref: 'Booking',
      required: [true, 'Review must belong to a booking.'],
      unique: true,
    },
  },
  {
    toJSON: { versionKey: false, virtuals: true },
    toObject: { versionKey: false, virtuals: true },
  },
);

reviewSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  //  .populate({
  //   path: 'booking',
  //   select: 'imageCover tourName',
  // });
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

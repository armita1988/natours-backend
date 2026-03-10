/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const slugify = require('slugify');
const { locationSchema } = require('./locationModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tout must have name'],
      unique: true,
      trim: true,
      minLength: [10, 'A tour name must have 10 or more characters'],
      maxLength: [40, 'A tour name must have 40 or less characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A tout must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tout must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tout must have a difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either: easy,medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be equal or less than 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (value) {
          return this.price > value;
        },
        message: `priceDiscount({VALUE}) must be below regular price ${this.price}`,
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: {
      type: [String],
    },
    startDates: {
      type: [Date],
    },
    slug: String,
    createdAt: {
      type: Date,
      default: new Date().toISOString(),
    },
    secretTour: {
      type: Boolean,
      default: false,
      select: false,
    },

    startLocation: locationSchema,
    locations: [locationSchema.clone().add({ day: Number })],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        delete ret.secretTour;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        delete ret.secretTour;
        return ret;
      },
    },
  },
);

//index
tourSchema.index({ price: 1, ratingsAverage: -1 });
//hooks
tourSchema.pre(/^find/, function () {
  this.populate({
    path: 'guides',
    select: 'name email',
  });
});

tourSchema.pre('save', function () {
  this.slug = slugify(this.name, {
    lower: true,
    trim: true,
  });
});

tourSchema.post('save', function (doc) {
  console.log('document saved...');
  console.log(doc);
});

tourSchema.pre(/^find/, function () {
  this.find({ secretTour: { $ne: true } });
});

// tourSchema.pre(/^find/, function () {
//   this.populate({ path: 'reviews' });
// });

tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
});

tourSchema.virtual('durationWeeks').get(function () {
  return Math.round(this.duration / 7);
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;

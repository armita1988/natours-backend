const mongoose = require('mongoose');
const validator = require('validator');

const bookingSchema = new mongoose.Schema(
  {
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Booking must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a user.'],
    },
    price: {
      type: Number,
      required: [true, 'Booking must have a price.'],
    },
    bookingReference: {
      type: String,
      unique: true,
      default: function () {
        return `BK-${this._id.toString().slice(-6).toUpperCase()}`;
      },
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeChargeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    currency: {
      type: String,
      default: 'cad',
    },

    paymentStatus: {
      type: String,
      paymentStatus: ['unpaid', 'pending', 'paid', 'failed', 'refunded'],
      required: [true, 'Payment status is required.'],
      // default: 'paid',
    },

    bookingStatus: {
      type: String,
      bookingStatus: ['pending', 'confirmed', 'cancelled', 'expired'],
      required: [true, 'Booking status is required.'],
      // default: 'confirmed',
    },

    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    customerEmail: {
      type: String,
    },
    paymentMethodBrand: {
      type: String,
    },
    paymentMethodLast4: {
      type: String,
    },
    customerName: {
      type: String,
    },

    tourName: {
      type: String,
    },
    imageCover: {
      type: String,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
    startDate: {
      type: Date,
      required: [true, 'Booking must have a start date.'],
    },
    endDate: {
      type: Date,
      required: [true, 'Booking must have an end date.'],
    },
    numberOfTravelers: {
      type: Number,
      default: 1,
    },
    request: {
      type: String,
      trim: true,
      maxlength: [500, 'Request cannot be more than 500 characters.'],
    },
    phone: {
      type: String,
      validate: [validator.isMobilePhone, 'Contact mobile number is required.'],
    },
  },
  {
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
    toObject: {
      virtuals: true,
      versionKey: false,
    },
  },
);

bookingSchema.pre(/^find/, function () {
  this.populate({
    path: 'tour',
    select:
      'name price difficulty duration summary maxGroupSize startLocation schedule slug',
  });
});

bookingSchema.virtual('review', {
  ref: 'Review',
  foreignField: 'booking',
  localField: '_id',
  justOne: true,
});

// bookingSchema.pre('validate', function () {
//   if (this.bookingReference) return;
//   this.bookingReference = `BK-${this._id.toString().slice(-6).toUpperCase()}`;
// });

// bookingSchema.pre(/^find/, function () {
//   this.populate({
//     path: 'user',
//     select: 'name email',
//   }).populate({
//     path: 'tour',
//     select: 'name price duration difficulty',
//   });
// });

// bookingSchema.pre('save', function () {
//   this.price = this.tour.price;
// });

module.exports = mongoose.model('Booking', bookingSchema);

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const TourModel = require('../models/tourModel');
const UserModel = require('../models/userModel');
const BookingModel = require('../models/bookingModel');

function formatDate(
  date,
  options = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
  locales = 'en-US',
) {
  return new Date(date).toLocaleDateString(locales, options);
}

async function createBookingFromCheckout(session) {
  const { tourId, userId, bookingId, request, phone, numberOfTravelers } =
    session.metadata;
  let currentBooking = null;
  let currentTour = null;
  let currentUser = null;

  if (bookingId) {
    currentBooking = await BookingModel.findById(bookingId);
    if (!currentBooking) {
      throw new AppError(
        `Booking not found for Stripe session: ${session.id}`,
        404,
      );
    }
  } else {
    currentTour = await TourModel.findById(tourId);
    if (!currentTour) {
      throw new AppError(
        `Tour not found for Stripe session: ${session.id}`,
        404,
      );
    }
    currentUser = await UserModel.findById(userId);
    if (!currentUser) {
      throw new AppError(
        `User not found for Stripe session: ${session.id}`,
        404,
      );
    }
  }

  const existingBooking = await BookingModel.findOne({
    stripeSessionId: session.id,
  });

  if (existingBooking) return;

  const paymentIntent = await stripe.paymentIntents.retrieve(
    session.payment_intent,
    {
      expand: ['latest_charge'],
    },
  );

  const charge = paymentIntent.latest_charge;
  const card = charge?.payment_method_details?.card;

  if (!currentBooking) {
    const startDate = formatDate(currentTour.nextStartDate);
    let endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + currentTour.duration - 1);
    endDate = formatDate(endDate);

    await BookingModel.create({
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
      stripeChargeId: charge?.id,
      invoiceNumber: `INV-${new Date().getFullYear()}-${session.id.slice(-6).toUpperCase()}`,
      tour: tourId,
      user: userId,
      price: paymentIntent.amount_received / 100,
      currency: session.currency || 'cad',
      paymentMethodBrand: card?.brand,
      paymentMethodLast4: card?.last4,
      customerName: currentUser.name,
      customerEmail: session.customer_email || currentUser.email,
      tourName: currentTour.name,
      imageCover: currentTour.imageCover,
      paymentStatus: session.payment_status,
      bookingStatus: 'confirmed',
      request,
      phone,
      numberOfTravelers,
      startDate,
      endDate,
    });
  } else {
    currentBooking.stripeSessionId = session.id;
    currentBooking.stripePaymentIntentId = session.payment_intent;
    currentBooking.stripeChargeId = charge?.id;
    currentBooking.invoiceNumber = `INV-${new Date().getFullYear()}-${session.id.slice(-6).toUpperCase()}`;
    currentBooking.currency = session.currency || 'cad';
    currentBooking.paymentMethodBrand = card?.brand;
    currentBooking.paymentMethodLast4 = card?.last4;
    currentBooking.paymentStatus = session.payment_status;
    currentBooking.bookingStatus = 'confirmed';
    await currentBooking.save();
  }
  //console.log('saved booking ....');
}

// Stripe webhook
module.exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({
      received: true,
      ignored: event.type,
    });
  }

  const session = event.data.object;

  // if (!session.metadata?.tourId || !session.metadata?.userId) {
  //   return res.status(200).json({
  //     received: true,
  //     skipped: 'missing metadata',
  //   });
  // }

  try {
    await createBookingFromCheckout(session);
  } catch (err) {
    console.error(
      `Failed to create booking for Stripe session: ${session.id}. Error: ${err.message}`,
    );
    return res
      .status(500)
      .send(
        `Failed to create booking for Stripe session: ${session.id}. Error: ${err.message}`,
      );
  }

  return res.status(200).json({
    received: true,
    message: 'Booking created successfully',
  });
};

module.exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  let booking = null;
  const metadata = {};

  if (req.body.request && req.body.request.trim() !== '') {
    metadata.request = req.body.request.trim();
  }

  if (req.body.phone && req.body.phone.trim() !== '') {
    metadata.phone = req.body.phone.trim();
  }

  let quantity = req.body.numberOfTravelers * 1 || 1;
  metadata.numberOfTravelers = quantity;

  const { bookingId } = req.body;

  if (bookingId != null) {
    booking = await BookingModel.findById(bookingId);
  }

  if (!booking && bookingId != null) {
    return next(new AppError(`No booking found with ID: ${bookingId}`, 404));
  }

  const tour = await TourModel.findById(req.params.tourId);

  if (!tour) {
    return next(
      new AppError(`No tour found with ID :${req.params.tourId}`, 404),
    );
  }

  if (booking) {
    metadata.bookingId = booking._id.toString();
    quantity = booking.numberOfTravelers;
  } else {
    metadata.tourId = tour._id.toString();
    metadata.userId = req.user._id.toString();
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/me/bookings`,
    cancel_url: `${process.env.FRONTEND_URL}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),

    metadata,
    line_items: [
      {
        price_data: {
          currency: 'cad',
          unit_amount: Math.round(tour.price * 100),
          product_data: {
            name: tour.name,
            description: tour.summary,
            images: [
              `${process.env.FRONTEND_URL}/img/tours/${tour.imageCover}`,
            ],
          },
        },
        quantity,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    data: {
      url: session.url,
    },
  });
});

module.exports.createBooking = catchAsync(async (req, res, next) => {
  const booking = await BookingModel.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

module.exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await BookingModel.findById(req.params.bookingId);
  if (!booking) {
    throw new AppError(
      `No booking found with ID :${req.params.bookingId}`,
      404,
    );
  }
  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

module.exports.getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await BookingModel.find({ user: req.user._id }).populate({
    path: 'review',
  });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

module.exports.updateBooking = catchAsync(async (req, res, next) => {
  let booking = await BookingModel.findById(req.params.bookingId);
  if (!booking) {
    throw new AppError(
      `No booking found with ID :${req.params.bookingId}`,
      404,
    );
  }

  Object.assign(booking, req.body);
  booking = await booking.save();

  res.status(200).json({
    status: 'success',
    data: {
      booking,
    },
  });
});

module.exports.deleteBooking = catchAsync(async (req, res, next) => {
  const booking = await BookingModel.findByIdAndDelete(req.params.bookingId);
  if (!booking) {
    return next(new AppError('No booking found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    message: 'booking deleted successfully',
    data: {
      booking,
    },
  });
});

module.exports.getAllBookings = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(BookingModel.find(), req.query)
    .filter()
    .sort()
    .selectFields()
    .paginate();

  //execute query
  const bookings = await features.query;

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

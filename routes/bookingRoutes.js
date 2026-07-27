const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.isAuthenticated);

router
  .route('/checkout-session/:tourId')
  .post(bookingController.createCheckoutSession);

router
  .route('/')
  .post(bookingController.createBooking)
  .get(bookingController.getAllBookings);

router.route('/my-bookings').get(bookingController.getMyBookings);

router
  .route('/:bookingId')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);
module.exports = router;

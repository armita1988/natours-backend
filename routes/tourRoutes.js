const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tours-stats').get(tourController.getToursStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.isAuthenticated,
    authController.isAuthorized('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.isAuthenticated,
    authController.isAuthorized('lead-guide', 'admin'),
    tourController.createTour,
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.isAuthenticated,
    authController.isAuthorized('lead-guide', 'admin'),
    tourController.updateTour,
  )
  .delete(
    authController.isAuthenticated,
    authController.isAuthorized('lead-guide', 'admin'),
    tourController.deleteTour,
  );

module.exports = router;

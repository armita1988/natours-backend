const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });
router.use(authController.isAuthenticated);

router
  .route('/')
  .post(authController.isAuthorized('user'), reviewController.createReview)
  .get(reviewController.getAllReviews);
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.isAuthorized('user', 'admin'),
    reviewController.deleteReview,
  )
  .patch(authController.isAuthorized('user'), reviewController.updateReview);

module.exports = router;

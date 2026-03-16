const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');

module.exports.createReview = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  if (!req.body.user) {
    req.body.user = req.user._id;
  }

  const review = await Review.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

module.exports.getReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError(`'No review found with ID :${req.params.id}`, 404);
    // return next(new AppError(`'No review found with ID:${req.params.id}`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

module.exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    message: 'review deleted successfully',
    data: {
      review,
    },
  });
});

module.exports.getAllReviews = catchAsync(async (req, res, next) => {
  // console.log(req.params);
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }
  const features = new ApiFeatures(Review.find(filter), req.query)
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    results: reviews.length,

    data: {
      reviews,
    },
  });
});

module.exports.updateReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    throw new AppError(`'No review found with ID :${req.params.id}`, 404);
  }

  Object.assign(review, req.body);
  review = await review.save();

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

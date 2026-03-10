const Tour = require('../models/tourModel');
const ApiFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

module.exports.getAllTours = catchAsync(async (req, res, next) => {
  const queryStr = req.customQuery || req.query;
  //define query
  const features = new ApiFeatures(Tour.find(), queryStr)
    .filter()
    .sort()
    .selectFields()
    .paginate();

  //execute query
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
});

module.exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate({ path: 'reviews' });

  if (!tour) {
    throw new AppError(`'No tour found with ID :${req.params.id}`, 404);
    // return next(new AppError(`'No tour found with ID:${req.params.id}`, 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

module.exports.updateTour = catchAsync(async (req, res, next) => {
  //   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
  //     runValidators: true,
  //     new: true,
  //   });

  let tour = await Tour.findById(req.params.id);

  if (!tour) {
    throw new AppError(`'No tour found with ID :${req.params.id}`, 404);
    // return next(new AppError(`'No tour found with ID:${req.params.id}`, 404));
  }
  Object.assign(tour, req.body);
  tour = await tour.save();

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

module.exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

module.exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    message: 'tour deleted successfully',
    data: {
      tour,
    },
  });
});

module.exports.aliasTopTours = catchAsync(async (req, res, next) => {
  req.customQuery = {
    ...req.query,
    sort: '-ratingsAverage,price',
    limit: '5',
    fields: 'name,price,ratingsAverage,summary,difficulty',
  };
  next();
});

module.exports.getToursStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4.5 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    // { $match: { _id: { $ne: 'EASY' } } },
    { $sort: { avgPrice: 1 } },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

module.exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const stats = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: {
          //   $push: { name: '$name', price: '$price', startDates: '$startDates' },
          $push: '$name',
        },
      },
    },
    { $addFields: { month: '$_id' } },
    { $project: { _id: 0 } },
    { $sort: { month: 1 } },
    { $limit: 12 },
  ]);

  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: {
      stats,
    },
  });
});

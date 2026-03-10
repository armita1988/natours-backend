const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const ApiFeatures = require('../utils/apiFeatures');

const filterObject = (inputObj, ...allowedFields) => {
  const newObj = Object.keys(inputObj).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete inputObj[key];
    }
  });
  return newObj;
};

module.exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    throw new AppError(
      'This route is not for password updates. Please use /updateMyPassword.',
      400,
    );
  }
  //filter out unexpected fields
  const filteredBody = filterObject(req.body, 'email', 'name');

  //update user
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    runValidators: true,
    returnOriginal: false,
  });

  //send response
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

module.exports.deleteMe = catchAsync(async (req, res, next) => {
  //find corresponding user and deactivate it
  const user = await User.findByIdAndUpdate(req.user._id, { active: false });
  //send response
  res.status(204).json({
    status: 'success',
    message: 'user deleted successfully',
    data: { user },
  });
});

module.exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

module.exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

module.exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .selectFields()
    .paginate();
  const users = await features.query;

  if (users.length === 0) {
    throw new AppError('No user(s) found', 404);
  }

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

module.exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { active: false });
  if (!user) {
    throw new AppError('No user found with that ID', 404);
  }
  user.status(204).json({
    status: 'success',
    message: 'user deleted successfully',
  });
});

module.exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    throw new AppError(
      'This route is not for password updates. Please use /updateMyPassword.',
      400,
    );
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    returnOriginal: false,
  });
  if (!updatedUser) {
    throw new AppError('No user found with that ID', 404);
  }
  updatedUser.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

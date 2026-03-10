/* eslint-disable arrow-body-style */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/mailer');

const filterObject = (inputObj, ...allowedFields) => {
  Object.keys(inputObj).forEach((key) => {
    if (!allowedFields.includes(key)) {
      delete inputObj[key];
    }
  });
  return inputObj;
};

const signJwtToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  return token;
};

const createSendToken = (res, user, statusCode) => {
  //sign JWT token
  const token = signJwtToken(user._id);

  //remove password from response
  user.password = undefined;

  //set jwt in cookie
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
  });

  //send response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

module.exports.isAuthenticated = catchAsync(async (req, res, next) => {
  //check if jwt token exists in the header
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token === 'null' || !token) {
    throw new AppError('you are not logged in. please first log in', 401);
  }

  //validate jwt token

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  // console.log(decoded);

  //find corresponding user
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    throw new AppError(
      'The user belonging to this token does no longer exist.',
      401,
    );
  }
  //check password changed after jwt  token was issued
  if (currentUser.isPasswordChangedAfterJwtIssue(decoded.iat)) {
    throw new AppError(
      'User recently changed password! Please log in again.',
      401,
    );
  }
  //add user to req
  req.user = currentUser;
  next();
});

module.exports.isAuthorized = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppError('You do not have permission to perform this action!', 403),
      );
    }
    next();
  };
};

module.exports.signUp = catchAsync(async (req, res, next) => {
  if (Array.isArray(req.body)) {
    throw new AppError(
      'you are not allowd to create several users simultaneously',
      400,
    );
  }
  //remove unexpected fields from body
  const filteredBody = filterObject(
    req.body,
    'name',
    'email',
    'password',
    'passwordConfirm',
    'photo',
  );

  //create user
  const newUser = await User.create(filteredBody);

  //create JWT token & send response to client
  createSendToken(res, newUser, 201);
});

module.exports.login = catchAsync(async (req, res, next) => {
  //check user sent email & password
  if (!req.body.email || !req.body.password) {
    throw new AppError('please enter the email and password', 400);
  }
  //find corresponding user
  const user = await User.findOne({
    email: req.body.email,
  }).select('+password');

  //check user & password are correct
  if (!user || !(await user.isPasswordCorrect(req.body.password))) {
    throw new AppError('this email or password is not valid', 401);
  }

  //create JWT token & send response to client
  createSendToken(res, user, 200);
});

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  console.log('in forgot controller:', {
    email,
  });
  //check email exists in DB
  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new AppError('There is no user with email address.', 404);
  }
  //create reset token
  const resetToken = user.createPasswordResetToken();
  //save user with reset token
  await user.save();

  //send reset token by email
  const resetURL = `${req.protocol}://${req.get('host')}/app/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to:\n\n ${resetURL}.\n\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      from: 'armita@gmail.com',
      to: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      text: message,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save();

    throw new AppError(`something went wrong with sending email: ${err}`, 500);
  }

  //send response
  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //find user
  const user = await User.findOne({
    passwordResetToken: resetToken,
    passwordResetExpires: {
      $gte: Date.now(),
    },
  });
  if (!user) {
    throw new AppError('token is expired or invalid!', 400);
  }

  //update user's password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //update passwordChangedAt (pre-save hook)

  //create JWT token & send response to client
  createSendToken(res, user, 200);
});

module.exports.updateMyPassword = catchAsync(async (req, res, next) => {
  //find corresponding user
  const currentUser = await User.findById(req.user._id).select('+password');

  //check password is correct
  if (!(await currentUser.isPasswordCorrect(req.body.passwordCurrent))) {
    throw new AppError('Your current password is wrong.', 401);
  }
  //update password
  currentUser.password = req.body.password;
  currentUser.passwordConfirm = req.body.passwordConfirm;
  await currentUser.save();

  // 4) Log user in, send JWT
  createSendToken(res, currentUser, 200);
});

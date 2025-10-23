const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchasync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const ceateSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  //remove pass from output without saving
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchasync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  //we will make the token here so when somebody signs up successfully he is loged
  ceateSendToken(newUser, 201, res);
  // const token = signToken(newUser._id);

  // res.status(201).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

exports.login = catchasync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('please provide email and pass', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrecr email or password', 401));
  ceateSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.protect = catchasync(async (req, res, next) => {
  //get the token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next(new AppError('NOT logged IN', 401));

  //verfication the token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //check if user exists
  const currentUser = await User.findById(decode.id);
  if (!currentUser) return next(new AppError("the token doesn't exist", 401));
  //check if the password changed after the jwt creation
  if (currentUser.ChangedPasswordAfter(decode.iat))
    return next(
      new AppError('password changed resently so Please login again', 401)
    );
  //grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("you don't have premission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchasync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('no such email', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const reseturl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `frogot ur password? submit a patch reqwith your new pass and its confirmPass to ${reseturl}
  if you didn't forget please ignore this email`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'your email reset token(valid for 10 mins)',
      message,
    });
    res.status(200).json({
      status: 'success',
      msg: 'reset token sent successfully',
    });
  } catch (err) {
    (user.passwordResetToken = undefined),
      (user.passwordResetExpiry = undefined),
      await user.save({ validateBeforeSave: false });
    next(new AppError('could not send the email try later', 500));
  }
});

exports.resetPassword = catchasync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: Date.now() },
  });
  if (!user) return next(new AppError('token is invalid or expired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  (user.passwordResetToken = undefined),
    (user.passwordResetExpiry = undefined),
    await user.save();
  ceateSendToken(user, 200, res);
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
});

exports.updatePassword = catchasync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('wrong password', 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  ceateSendToken(user, 200, res);
});

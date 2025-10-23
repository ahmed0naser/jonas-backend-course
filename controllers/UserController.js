const User = require('./../models/userModel');
const ApiFeatures = require('./../utils/ApiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const filterObj = (obj, ...fields) => {
  const newobj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      newobj[el] = obj[el];
    }
  });
  return newobj;
};
exports.getusers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route can not update password use /updateMyPassword',
        400
      )
    );
  }
  const body = filterObj(req.body, 'name', 'email');
  const updateduser = await User.findByIdAndUpdate(req.user.id, body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    user: updateduser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.createusers = (req, res) => {
  res.status(500).json({
    message: 'route not defined',
  });
};
exports.getuser = (req, res) => {
  res.status(500).json({
    message: 'route not defined',
  });
};
exports.createuser = (req, res) => {
  res.status(500).json({
    message: 'route not defined',
  });
};
exports.updateuser = (req, res) => {
  res.status(500).json({
    message: 'route not defined',
  });
};

exports.delereuser = (req, res) => {
  res.status(500).json({
    message: 'route not defined',
  });
};

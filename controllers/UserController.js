const User = require("./../models/userModel");
const ApiFeatures = require("./../utils/ApiFeatures");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/AppError");
const factory = require("./handlerFactory");
const filterObj = (obj, ...fields) => {
  const newobj = {};
  Object.keys(obj).forEach((el) => {
    if (fields.includes(el)) {
      newobj[el] = obj[el];
    }
  });
  return newobj;
};
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "this route can not update password use /updateMyPassword",
        400
      )
    );
  }
  const body = filterObj(req.body, "name", "email");
  const updateduser = await User.findByIdAndUpdate(req.user.id, body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    user: updateduser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createusers = (req, res) => {
  res.status(500).json({
    message: "route not defined, please use signUp",
  });
};

exports.getusers = factory.getAll(User);
exports.getuser = factory.getOne(User);

exports.updateuser = factory.updateOne(User);

exports.deleteuser = factory.deleteOne(User);

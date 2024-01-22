const catchAsync = require('../utils/catchAsync');
const User = require('./../model/user');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allows) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allows.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'To update password Please choose the udpate password route',
        400,
      ),
    );
  }

  //filter field name only allowd fields to b modified
  const allowedObj = filterObj(req.body, 'name', 'email');

  //update user document
  const user = await User.findByIdAndUpdate(req.user.id, allowedObj, {
    runValidators: true,
    new: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = factory.getOne(User);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

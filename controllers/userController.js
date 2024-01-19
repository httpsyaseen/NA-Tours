const catchAsync = require('../utils/catchAsync');
const User = require('./../model/user');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allows) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allows.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     length: users.length,
//     users,
//   });
// });

exports.getUser = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    length: users.length,
    users,
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  //create error if users POSTs passsword

  if (req.body.password || req.body.passwordConfirm) {
    console.log('inside');
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

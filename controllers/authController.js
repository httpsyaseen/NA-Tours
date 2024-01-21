const User = require('./../model/user');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const sendingEmail = require('./../utils/sendEmail');
const crypto = require('crypto');
const { kMaxLength } = require('buffer');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statuscode, res) => {
  const token = generateToken(user._id);

  res.cookie('jwt', token, {
    httpOnly: true,
  });
  res.status(statuscode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
//SIGNUP
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please Provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid Email or Password', 401));
  }
  createSendToken(user, 200, res);
});

exports.protected = catchAsync(async (req, res, next) => {
  //GETTING TOKEN AND CHECK IF IT'S THERE
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(new AppError('You are not logged in. Login to get access'), 401);
  }
  //VERIFICATION TOKEN
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

  //CHECK IF STILL USER EXISTS IN THE DB
  const freshUser = await User.findById(decode.id); //after generating token checking if he user of that token exists or it gets deleted later
  if (!freshUser) {
    return next(
      new AppError('The user with the logged in token get deleted.', 401),
    );
  }

  console.log(freshUser);

  //CHECK IF USER HAS CHANGED PASSWORD AFTER TOKEN GENERATION(LOGIN)
  if (freshUser.isPassChanged(decode.iat)) {
    return next(new AppError('User have changed the Password. Login again.'));
  }

  req.user = freshUser;
  next();
});

exports.restrictedTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('The user donot have permission to delete the tour', 403),
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //getting user

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    next(new AppError('Cannot found any User with this Email', 404));
  }

  //genearting reset link
  const resetLink = user.generateResetLink();
  await user.save({ validateBeforeSave: false });

  //sending the resetlink to user
  const resetLinkUrl = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/resetpassword/${resetLink}`;

  const message = `Forgot your password? Don't worry just click on the given link and reset your password\n${resetLinkUrl}\nIf you didn't request a reset password ignore this email`;

  try {
    await sendingEmail({
      to: user.email,
      subject: 'Forgot your password?',
      text: message,
    });
  } catch (err) {
    console.log(err.message);
    return next(
      new AppError('Someting went erong with sending the email', 500),
    );
  }

  res.status(200).send({
    status: 'success',
    message: 'reset token has been sent to email',
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //GET USER BASED ON TOKEN
  const hashtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  let user = await User.findOne({
    passwordResetLink: hashtoken,
    passwordExpiresAt: { $gt: Date.now() },
  });

  //IF TOKEN EXPIRED OR USER EXISTS
  if (!user) {
    return next(new AppError('Token must be invalid or Expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetLink = undefined;
  user.passwordExpiresAt = undefined;
  await user.save();
  //UPDATE PASSWORD CHANGED AT PROPERTY
  //LOG USER IN SEND JWT TOKEN
  createSendToken(user, 201, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //GET USER FROM COLLECTIONS
  let user = await User.findById(req.user.id).select('+password');
  console.log(user);

  //CHECK IF CURENT ASSWORD IS CORRECT
  if (!user.correctPassword(req.body.passwordCurrent, user.password)) {
    return next(new AppError('Password is Incorrect', 401));
  }

  //SAVE THE NEW PASSWORD
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //LOGS IN USER
  createSendToken(user, 200, res);
});

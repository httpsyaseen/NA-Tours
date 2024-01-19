const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  email: {
    type: String,
    unique: true,
    low: true,
    required: [true, 'Pleae provide an Email'],
    validate: [validator.isEmail, 'Please Provide a valid email'],
  },

  password: {
    type: String,
    minlength: [8, 'Password must be more than or equal to 8 characters'],
    required: [true, 'Please provide a password'],
    select: false,
  },
  role: {
    type: String,
    default: 'user',
  },
  photo: String,
  passwordConfirm: {
    type: String,
    min: [8, 'Password must be more than or equal to 8 characters'],
    required: [true, 'Please Confirm your password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password Doesnot Match',
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: Date,
  passwordExpiresAt: Date,
  passwordResetLink: String,
});

userSchema.pre(/^find/, function (next) {
  console.log('inside middleware');
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (candiatepass, userpass) {
  return await bcrypt.compare(candiatepass, userpass);
};

userSchema.methods.isPassChanged = function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const passChangedTime = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return passChangedTime > JWTTimeStamp;
  }
  return false;
};

userSchema.methods.generateResetLink = function () {
  const resetLink = crypto.randomBytes(32).toString('hex');

  this.passwordResetLink = crypto
    .createHash('sha256')
    .update(resetLink)
    .digest('hex');

  this.passwordExpiresAt = Date.now() + 10 * 60 * 1000;
  return resetLink;
};
const User = mongoose.model('User', userSchema);

module.exports = User;

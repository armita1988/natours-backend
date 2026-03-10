const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, 'user must have a name'],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      required: [true, 'user must have an email'],
      validate: [validator.isEmail, 'please enter a valid email'],
    },
    photo: String,
    role: {
      type: String,
      default: 'user',
      enum: ['user', 'guide', 'lead-guide', 'admin'],
    },
    password: {
      type: String,
      required: [true, 'please enter your password'],
      minLength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'please enter password confirmation'],
      minLength: 8,
      select: false,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: `passwordConfirm ({VALUE}) does not match the password ${this.password}`,
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },

  {
    toJSON: {
      virtuals: true,
      versionKey: false,
    },
    toObject: {
      virtuals: true,
      versionKey: false,
    },
  },
);

//hooks
userSchema.pre('save', async function () {
  if (this.isNew || this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
});

userSchema.pre('save', function () {
  if (this.isModified('password') && !this.isNew) {
    this.passwordChangedAt = Date.now() - 2000; //update passwordChangedAt
  }
});

userSchema.pre(/^find/, function () {
  this.find({ active: { $ne: false } });
});

// methods
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.isPasswordChangedAfterJwtIssue = function (jwtIat) {
  if (this.passwordChangedAt) {
    // console.log(jwtIat * 1000, this.passwordChangedAt.getTime());
    return this.passwordChangedAt.getTime() > jwtIat * 1000;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

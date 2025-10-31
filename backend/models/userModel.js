const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    // Not required for Google-auth users
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// ✅ Signup (email + password)
userSchema.statics.signup = async function (email, password) {
  if (!email || !password) throw Error('All fields must be filled');
  if (!validator.isEmail(email)) throw Error('Email is not valid');
  if (!validator.isStrongPassword(password)) throw Error('Password is not strong enough');

  const exists = await this.findOne({ email });
  if (exists) throw Error('Email already in use');

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await this.create({
    email,
    password: hash,
    authProvider: 'local',
    isVerified: true,
  });

  return user;
};

// ✅ Login (email + password)
userSchema.statics.login = async function (email, password) {
  if (!email || !password) throw Error('All fields must be filled');

  const user = await this.findOne({ email });
  if (!user) throw Error('Incorrect Email');

  if (user.authProvider !== 'local') {
    throw Error('This account uses Google Login. Try signing in with Google.');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw Error('Incorrect Password');

  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

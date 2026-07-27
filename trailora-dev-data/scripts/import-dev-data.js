/* eslint-disable no-console */
// Trailora seed import script
// Place this file where the model paths below make sense, or adjust require paths.

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// If this script is placed in dev-data/scripts, this points to project root .env
// Adjust if your folder structure differs.
dotenv.config({ path: path.join(__dirname, '../../.env') });

const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const Booking = require('../../models/bookingModel');

const DB = process.env.DATABASE?.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

if (!DB) {
  console.error('DATABASE is missing. Check your .env file.');
  process.exit(1);
}

mongoose.connect(DB).then(() => console.log('DB connection successful'));

const readJSON = (fileName) =>
  JSON.parse(fs.readFileSync(path.join(__dirname, '../data', fileName), 'utf-8'));

const users = readJSON('users.json');
const tours = readJSON('tours.json');
const bookings = readJSON('bookings.json');
const reviews = readJSON('reviews.json');

const importData = async () => {
  try {
    // Important: User.create triggers save middleware, so passwords are hashed.
    await User.create(users);
    await Tour.create(tours);
    await Booking.create(bookings);
    await Review.create(reviews);

    console.log('Trailora seed data imported successfully.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const deleteData = async () => {
  try {
    await Review.deleteMany();
    await Booking.deleteMany();
    await Tour.deleteMany();
    await User.deleteMany();

    console.log('Trailora seed data deleted successfully.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();

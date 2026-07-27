const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '/../config.env'), quiet: true });

const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');
const Booking = require('../models/bookingModel');

// connect to database
const url = process.env.DATABASE_URL.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(url)
  .then(() => console.log('**** connected to DATABASE *****'))
  .catch((err) => console.error(err));

// read JSON helper
const readJSON = (relativePath) => {
  const file = fs.readFileSync(path.join(__dirname, relativePath), {
    encoding: 'utf8',
  });

  return JSON.parse(file);
};

// import data to DB
const importData = async () => {
  const users = readJSON('../trailora-dev-data/data/users.json');
  const tours = readJSON('../trailora-dev-data/data/tours.json');
  const reviews = readJSON('../trailora-dev-data/data/reviews.json');
  const bookings = readJSON('../trailora-dev-data/data/bookings.json');

  const createdUsers = await User.create(users);
  const createdTours = await Tour.create(tours);
  const createdReviews = await Review.create(reviews);
  const createdBookings = await Booking.create(bookings);

  return {
    users: createdUsers,
    tours: createdTours,
    reviews: createdReviews,
    bookings: createdBookings,
  };
};

// delete data from DB
const deleteData = async () => {
  const deletedBookings = await Booking.deleteMany();
  const deletedReviews = await Review.deleteMany();
  const deletedTours = await Tour.deleteMany();
  const deletedUsers = await User.deleteMany();

  return {
    deletedBookings,
    deletedReviews,
    deletedTours,
    deletedUsers,
  };
};

if (process.argv[2] === '--import') {
  importData()
    .then((res) => {
      console.log(
        `********* ${res.users.length} users inserted to DB *********`,
      );
      console.log(
        `********* ${res.tours.length} tours inserted to DB *********`,
      );
      console.log(
        `********* ${res.reviews.length} reviews inserted to DB *********`,
      );
      console.log(
        `********* ${res.bookings.length} bookings inserted to DB *********`,
      );
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => process.exit());
} else if (process.argv[2] === '--delete') {
  deleteData()
    .then(() => {
      console.log('********* bookings removed from DB *********');
      console.log('********* reviews removed from DB *********');
      console.log('********* tours removed from DB *********');
      console.log('********* users removed from DB *********');
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => process.exit());
}

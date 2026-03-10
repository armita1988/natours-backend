const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '/../config.env'), quiet: true });
const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Review = require('../models/reviewModel');

//connect to database
const url = process.env.DATABASE_URL.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(url)
  .then(() => console.log('****connected to DATABASE*****'))
  .catch((err) => console.error(err));

//import data to DB
const importData = async () => {
  const toursArr = fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, {
    encoding: 'utf8',
  });
  const usersArr = fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, {
    encoding: 'utf8',
  });
  const reviewsArr = fs.readFileSync(
    `${__dirname}/../dev-data/data/reviews.json`,
    {
      encoding: 'utf8',
    },
  );
  const tours = await Tour.create(JSON.parse(toursArr));
  const users = await User.create(JSON.parse(usersArr));
  const reviews = await Review.create(JSON.parse(reviewsArr));
  return { tours, users, reviews };
};

//delete data from DB
const deleteData = async () => {
  const deletedTours = await Tour.deleteMany();
  const deletedUsers = await User.deleteMany();
  const deletedReviews = await Review.deleteMany();
  return { deletedTours, deletedUsers, deletedReviews };
};

if (process.argv[2] === '--import') {
  importData()
    .then((res) => {
      console.log(
        ` ********* ${res.tours.length} tours inserted to DB ********`,
      );
      console.log(
        ` ********* ${res.users.length} users inserted to DB ********`,
      );
      console.log(
        ` ********* ${res.reviews.length} reviews inserted to DB ********`,
      );
    })
    .catch((err) => console.log(err))
    .finally(() => process.exit());
} else if (process.argv[2] === '--delete') {
  deleteData()
    .then((res) => {
      console.log(
        ` ********* ${res.deletedTours.length} tours removed from DB ********`,
      );
      console.log(
        ` ********* ${res.deletedUsers.length} users removed from DB ********`,
      );
      console.log(
        ` ********* ${res.deletedReviews.length} reviews removed from DB ********`,
      );
    })
    .catch((err) => console.log(err))
    .finally(() => process.exit());
}

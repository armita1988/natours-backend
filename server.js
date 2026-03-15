const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

//load config
dotenv.config({ path: path.join(`${__dirname}`, 'config.env'), quiet: true });
//load app
const app = require('./app');

//connect to DB
const url = process.env.DATABASE_URL.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(url)
  .then(() => console.log('*******DATABASE connection established*******'));

//start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, 'localhost', () => {
  console.log(`app is listening to port ${PORT} ...`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down the server...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

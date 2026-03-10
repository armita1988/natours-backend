const nodemailer = require('nodemailer');

const configOptions = {
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
};
module.exports.sendEmail = async (options) => {
  const transporter = nodemailer.createTransport(configOptions);
  return transporter.sendMail({
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.text,
  });
};

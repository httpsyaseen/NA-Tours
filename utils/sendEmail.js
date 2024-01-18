const nodemailer = require('nodemailer');

const receipt = 'hello@jonas.io';
const sendingEmail = async (options) => {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,

    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  let mailOptions = {
    from: 'Yaseen <yaseenwalker1@gmail.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    // html: `<p> ${options.text}</p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendingEmail;

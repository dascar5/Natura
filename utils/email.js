const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'bec0828b9a2a1d',
      pass: 'c29674b088d3d6',
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Bogdan Laban <bole.laban@yahoo.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;

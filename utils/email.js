const nodemail = require('nodemailer');

const sendEmail = async (options) => {
  try {
    const transporter = nodemail.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 587,
      auth: {
        user: '9b0f8232d3ef27',
        pass: '8ad7eefd7f22f2',
      },
    });
    const mailoptions = {
      from: 'ahmed <test@test.io>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    await transporter.sendMail(mailoptions);
  } catch (err) {
    console.log('BOOOOOM', err);
  }
};
module.exports = sendEmail;

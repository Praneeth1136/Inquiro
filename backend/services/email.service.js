
import nodemailer from 'nodemailer';

const isEmailConfigured = Boolean(
  process.env.GOOGLE_USER &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GOOGLE_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

if (isEmailConfigured) {
  transporter
    .verify()
    .then(() => {
      console.log('Email transporter is ready to send emails');
    })
    .catch((err) => {
      console.warn('Email transporter verification failed:', err.message || err);
    });
} else {
  console.warn('Email transporter is not fully configured. Email sending is disabled.');
}




const sendEmail = async ({ to, subject, text, html }) => {
  if (!isEmailConfigured) {
    console.warn('Skipping email send because email configuration is incomplete.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"PRANEETH" <${process.env.GOOGLE_USER}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendEmail;
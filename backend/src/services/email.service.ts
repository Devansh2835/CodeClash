import nodemailer from 'nodemailer';
import env from '../config/env';

let transporter: nodemailer.Transporter;

if (env.EMAIL_OAUTH_CLIENT_ID && env.EMAIL_OAUTH_CLIENT_SECRET && env.EMAIL_OAUTH_REFRESH_TOKEN) {
  // Use OAuth2 for Gmail and other providers that support it
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: env.EMAIL_USER,
      clientId: env.EMAIL_OAUTH_CLIENT_ID,
      clientSecret: env.EMAIL_OAUTH_CLIENT_SECRET,
      refreshToken: env.EMAIL_OAUTH_REFRESH_TOKEN,
      accessToken: env.EMAIL_OAUTH_ACCESS_TOKEN,
    },
  });
} else {
  // Fallback to username/password auth
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: Boolean(env.EMAIL_SECURE),
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASSWORD,
    },
  });
}

// Verify transporter at startup (non-blocking)
transporter.verify().then(() => {
  console.log('✅ Email transporter is ready');
}).catch((err) => {
  console.warn('⚠️ Email transporter verification failed:', err && err.message ? err.message : err);
});

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: env.EMAIL_FROM,
    to: email,
    subject: 'Verify your Code Battle account',
    html: `
      <div>
        <h2>Welcome to Code Battle! ⚔️</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #007bff; padding: 10px; background: #f8f9fa; border-radius: 5px; text-align: center; margin: 20px 0;">
          ${otp}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr>
        <p>Code Battle - The Ultimate 1v1 Coding Arena</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    // Provide actionable guidance for common Gmail auth errors
    if (error && (error as any).responseCode === 534) {
      console.error('Gmail rejected the login attempt. If you are using Gmail, create an App Password or configure OAuth2. See https://support.google.com/mail/?p=WebLoginRequired');
    }
    throw new Error('Failed to send verification email');
  }
}
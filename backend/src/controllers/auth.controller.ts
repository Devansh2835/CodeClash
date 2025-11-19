import { Request, Response } from 'express';
import User from '../models/User.model';
import { hashPassword, comparePassword } from '../utils/bcrypt';
import { generateAccessToken } from '../utils/jwt';
import { generateOTP, isOTPExpired } from '../utils/otp';
import { sendOTPEmail } from '../services/email.service';

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP
    const otp = generateOTP();
    // Try to send OTP email first. Only persist user if email was sent successfully.
    try {
      await sendOTPEmail(email, otp);
    } catch (err) {
      console.error('Signup - email send failed, aborting user creation:', err);
      res.status(500).json({ error: 'Failed to send verification email' });
      return;
    }

    // Create user after OTP was sent
    try {
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        otp,
        otpCreatedAt: new Date(),
        isVerified: false,
      });

      res.status(201).json({
        message: 'User created. Please verify your email with the OTP sent.',
        userId: user._id,
      });
    } catch (createErr: any) {
      // If user creation fails due to duplicate key (race condition), inform client
      console.error('Signup - failed to create user after email sent:', createErr);
      if (createErr.code === 11000) {
        res.status(400).json({ error: 'User already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create user' });
      }
    }
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function verifyOTP(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: 'User already verified' });
      return;
    }

    if (!user.otp || !user.otpCreatedAt) {
      res.status(400).json({ error: 'No OTP found. Please request a new one.' });
      return;
    }

    if (isOTPExpired(user.otpCreatedAt)) {
      res.status(400).json({ error: 'OTP expired. Please request a new one.' });
      return;
    }

    if (user.otp !== otp) {
      res.status(400).json({ error: 'Invalid OTP' });
      return;
    }

    // Verify user
    user.isVerified = true;
    user.otp = undefined;
    user.otpCreatedAt = undefined;
    await user.save();

    // Generate token
    const token = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: 'Email verified successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
}

export async function resendOTP(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: 'User already verified' });
      return;
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = otp;
    user.otpCreatedAt = new Date();
    await user.save();

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ error: 'Please verify your email first' });
      return;
    }

    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        trophies: user.trophies,
        arena: user.arena,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const user = await User.findById(req.user?.userId).select('-password -otp');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        trophies: user.trophies,
        totalGames: user.totalGames,
        wins: user.wins,
        losses: user.losses,
        winrate: user.winrate,
        arena: user.arena,
        badges: user.badges,
        metamaskAddress: user.metamaskAddress,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
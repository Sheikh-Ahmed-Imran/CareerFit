import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["hr", "applicant"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }     

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    // if token already exists
    if (req.cookies?.token) {
      return res.status(400).json({ message: "Already logged in. Please logout first." });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
        path: "/"
    });

    res.json({ message: "Login successful", role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // must match login
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // must match login
    path: "/", // very important!
  });
  res.json({ message: "Logged out successfully" });
};



export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Create reset URL (frontend link)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Send Email (simple example)
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use your SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
const mailOptions = {
  from: "CareerFit Team",
  to: user.email,
  subject: "CareerFit Password Reset Request",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a73e8; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">CareerFit</h1>
      </div>
      <div style="padding: 30px; color: #333;">
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>We received a request to reset your CareerFit account password.</p>
        <p>Click the button below to set a new password. This link will expire in <strong>10 minutes</strong>.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #1a73e8; color: white; text-decoration: none; padding: 12px 25px; border-radius: 5px; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        <p>If you did not request a password reset, please ignore this email or contact our support.</p>
        <p>Thanks,<br />The CareerFit Team</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
        &copy; ${new Date().getFullYear()} CareerFit. All rights reserved.
      </div>
    </div>
  `,
};


    await transporter.sendMail(mailOptions);

    res.json({ message: "Reset link sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// STEP 2: Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const checkCookie = (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ authenticated: false, message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      authenticated: true,
      id: decoded.id,
      role: decoded.role
    });
  } catch (err) {
    res.status(401).json({ authenticated: false, message: "Invalid or expired token" });
  }
};


export const getCurrentUser = (req, res) => {
  res.json({ message: "User fetched", user: req.user });
};

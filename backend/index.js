import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import auth from "./routes/auth.js";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import cors from "cors";

dotenv.config();

const app = express();
let isConnected = false;

// ✅ CORS MUST BE FIRST (before routes & parsers)
const allowedOrigin = process.env.FRONTEND_URL?.trim();
if (!allowedOrigin) {
  console.error("❌ FRONTEND_URL is not set in .env file!");
}

app.use(cors({
  origin: allowedOrigin,         // 👈 use your actual frontend URL
  credentials: true,             // 👈 allows cookies / secure requests
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

// ✅ Parse JSON
app.use(express.json());

// ✅ Parse cookies
app.use(cookieParser());

// ✅ Connect DB if not already connected
app.use((req, res, next) => {
  if (!isConnected) {
    connectDB();
    isConnected = true;
  }
  next();
});

// ✅ Routes
app.use("/api/v1/auth", auth);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("Server is running & connected to MongoDB!");
});

app.get("/test", (req, res) => {
  res.send("Test route working fine!");
});

// ✅ Export for Vercel (do NOT app.listen)
export default app;

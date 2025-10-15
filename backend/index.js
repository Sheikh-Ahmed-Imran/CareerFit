import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import auth from './routes/auth.js';
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

// Parse JSON
app.use(express.json());
app.use(cookieParser());

// CORS - only allow your frontend
const allowedOrigin = process.env.FRONTEND_URL;
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// Routes
app.use('/api/v1/auth', auth);

// Default route
app.get("/", (req, res) => {
  res.send("Server is running & connected to MongoDB!");
});

export default app;

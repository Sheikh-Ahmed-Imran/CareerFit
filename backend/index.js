import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import auth from './routes/auth.js';
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Dynamic CORS for preflight requests
const allowedOrigin = process.env.FRONTEND_URL;

app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Handle OPTIONS preflight requests
app.options("*", cors({
  origin: allowedOrigin,
  credentials: true,
}));

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    process.exit(1);
  }
};
connectDB();

// Routes
app.use('/api/v1/auth', auth);

app.get("/", (req, res) => {
  res.send("Server is running & connected to MongoDB!");
});

// On Vercel, we export the app instead of calling listen()
export default app;

// If you want to run locally, uncomment this:
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

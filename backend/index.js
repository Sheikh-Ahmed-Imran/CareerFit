import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import auth from './routes/auth.js';
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(cookieParser());

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

const PORT = process.env.PORT || 5000;
//app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
export default app;
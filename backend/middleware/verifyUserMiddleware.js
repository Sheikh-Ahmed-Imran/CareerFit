import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const verifyUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch minimal user info from DB
    const user = await User.findById(decoded.id).select("name role email");
    if (!user) return res.status(404).json({ message: "User not found" });

    req.user = user; // attach full user object
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

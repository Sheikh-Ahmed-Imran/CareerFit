import express from "express";
import { register, login, logout, forgotPassword, resetPassword, checkCookie, getCurrentUser } from "../controllers/auth.js";
import { verifyUser } from "../middleware/verifyUserMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post('/logout',verifyUser,logout)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/check-cookie",verifyUser, checkCookie); 
router.get("/me",verifyUser, getCurrentUser); 

export default router;

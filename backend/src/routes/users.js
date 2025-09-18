import express from "express";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// Protected route: profile info
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ email: req.user.email, portfolio: [] });
});

export default router;

import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import admin from "firebase-admin";

const router = express.Router();



// ========== SIGNUP - Create new user ==========
router.post("/signup", async (req, res) => {
  try {
    const db = admin.firestore();  // ← Get db reference HERE, inside the route
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }
    
    // Check if user already exists in Firestore
    const existingUser = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (!existingUser.empty) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    
    // Save user to Firestore
    const userRef = await db.collection('users').add({
      email,
      password: hashed,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ User registered: ${email} (ID: ${userRef.id})`);
    
    res.json({ 
      message: "User registered successfully ✅",
      userId: userRef.id 
    });
    
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// ========== LOGIN - Authenticate user ==========
router.post("/login", async (req, res) => {
  try {
    const db = admin.firestore();  // ← Get db reference HERE, inside the route
    
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Find user in Firestore
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .get();
    
    if (userSnapshot.empty) {
      console.log(`⚠️ Login attempt for non-existent user: ${email}`);
      return res.status(400).json({ error: "Invalid credentials ❌" });
    }
    
    // Get user data from Firestore
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    // Verify password
    const validPassword = await bcrypt.compare(password, userData.password);
    
    if (!validPassword) {
      console.log(`⚠️ Invalid password attempt for user: ${email}`);
      return res.status(400).json({ error: "Invalid credentials ❌" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        email: userData.email,
        userId: userDoc.id 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );
    
    console.log(`✅ User logged in: ${email}`);
    
    res.json({ 
      token,
      email: userData.email,
      message: "Login successful ✅"
    });
    
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

export default router;

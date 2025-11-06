import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import admin from "firebase-admin";

const router = express.Router();



// ========== SIGNUP - Create new user ==========
router.post("/signup", async (req, res) => {
  try {
    const db = admin.firestore();  // ← Get db reference HERE, inside the route
    
    const { name, email, password, avatar } = req.body;
    
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    if (name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters' });
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
    
    // Save user to Firestore with avatar
    const userRef = await db.collection('users').add({
      name: name.trim(),
      email,
      password: hashed,
      avatar: avatar || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`✅ User registered: ${name} ${email} (ID: ${userRef.id})`);
    
    res.json({ 
      message: "User registered successfully ✅",
      userId: userRef.id,
      name : name.trim()
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
        userId: userDoc.id,
        username: userData.name,
        avatar: userData.avatar || null,
        isAdmin: userData.isAdmin || false,
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" }
    );
    
    console.log(`✅ User logged in: ${userData.name} (${email})${userData.isAdmin ? ' [ADMIN]' : ''}`);
    
    res.json({ 
      token,
      email: userData.email,
      userId: userDoc.id,
      username: userData.name,
      isAdmin: userData.isAdmin || false,
      message: "Login successful ✅"
    });
    
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// ========== GET AVATARS - List available avatar files ==========
router.get("/avatars", async (req, res) => {
  try {
    const bucketName = process.env.VITE_FIREBASE_STORAGE_BUCKET;
    const bucket = bucketName ? admin.storage().bucket(bucketName) : admin.storage().bucket();
    
    // List all files in the 'avatar' folder
    const [files] = await bucket.getFiles({ prefix: 'avatar/' });
    
    // Filter out the folder itself and extract filenames
    const avatars = files
      .filter(file => file.name !== 'avatar/' && !file.name.endsWith('/'))
      .map(file => {
        const filename = file.name.split('/').pop();
        return filename;
      });
    
    res.json({ avatars });
    
  } catch (error) {
    console.error("❌ Error listing avatars:", error);
    res.status(500).json({ error: "Failed to load avatars" });
  }
});

export default router;

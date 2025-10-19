import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import admin from "firebase-admin";

// Load environment variables FIRST
dotenv.config();

// ====== Initialize Firebase BEFORE importing routes ======
try {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL
    })
  });
  console.log('✅ Firebase Admin initialized successfully');
  console.log('📁 Project ID:', process.env.FIREBASE_PROJECT_ID);
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
}
// =========================================================

// NOW import routes (after Firebase is initialized)
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import cardRoutes from "./routes/cardsFirebase.js";
import cardsV2Routes from "./routes/cardsV2.js";
import walletRoute from "./routes/wallet.js";
import chatRoutes from "./routes/chat.js";
import portfolioRoutes from "./routes/portfolio.js";

const app = express();

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.url}`);
  console.log(`Headers:`, JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// Configure CORS to allow frontend origin
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Log environment configuration
console.log('\n🔧 Environment Configuration:');
console.log(`PORT: ${process.env.PORT || 3001}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
console.log(`DATABASE: Firebase Firestore`);
console.log(`FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID || '❌ Missing'}`);
console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Configured' : '❌ Missing'}`);
console.log(`PSA_API_KEY: ${process.env.PSA_API_KEY ? '✅ Configured' : '❌ Missing'}`);
console.log(`POKEMON_TCG_API_KEY: ${process.env.POKEMON_TCG_API_KEY ? '✅ Configured' : '❌ Missing'}`);

// Image proxy to bypass CORS on external images
app.get("/api/proxy-image", async (req, res) => {
  const { url } = req.query;
  console.log(`\n📸 Image Proxy Request: ${url}`);
  
  if (!url) {
    console.error('❌ Image proxy error: Missing URL parameter');
    return res.status(400).json({ error: "Missing url parameter" });
  }
  
  try {
    console.log(`⬇️ Fetching image from: ${url}`);
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    const contentType = response.headers['content-type'] || 'image/png';
    console.log(`✅ Image fetched successfully (${contentType})`);
    
    res.set('Content-Type', contentType);
    res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    res.send(response.data);
  } catch (error) {
    console.error('❌ Image proxy error:', {
      url,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText
    });
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cards", cardRoutes);
app.use("/api/v2/cards", cardsV2Routes); // Production-ready API with PSA + TCG integration
app.use("/api/wallet", walletRoute);
app.use("/api/chat", chatRoutes); // Chat/messaging routes
app.use("/api/portfolio", portfolioRoutes); // Portfolio history and analytics

app.get("/", (req, res) => {
  res.json({ message: "Trading Card Marketplace API running ✅" });
});

const PORT = process.env.PORT || 3001;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('\n❌ Unhandled Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
});

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Database: Firebase Firestore`);
  console.log(`🌐 API Base: http://localhost:${PORT}`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`📦 API V1: http://localhost:${PORT}/api/cards`);
  console.log(`📦 API V2: http://localhost:${PORT}/api/v2/cards`);
  console.log('='.repeat(50) + '\n');
});

import jwt from "jsonwebtoken";
import ADMIN_EMAILS from "../config/admins.js";

/**
 * Admin-only middleware using email whitelist
 * Requires valid JWT token AND email must be in ADMIN_EMAILS list
 */
export default function (req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: "Authentication required", 
      message: "Please log in to access this resource" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if user's email is in admin whitelist
    if (!ADMIN_EMAILS.includes(decoded.email)) {
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "Admin access required. Contact administrator for access." 
      });
    }
    
    console.log(`✅ Admin access granted: ${decoded.email}`);
    next();
  } catch (err) {
    res.status(403).json({ 
      error: "Invalid token",
      message: "Your session is invalid or expired" 
    });
  }
}


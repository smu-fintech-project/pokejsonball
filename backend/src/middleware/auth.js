import jwt from "jsonwebtoken";

// Middleware for REST API routes
export function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
}

// Default export for backward compatibility
export default authenticateToken;

// Middleware for Socket.IO connections
export function authenticateSocket(socket, next) {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.error('❌ Socket auth failed: No token provided');
    return next(new Error('Authentication error: No token provided'));
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    socket.user = decoded;
    console.log(`✅ Socket authenticated for user: ${decoded.userId}`);
    next();
  } catch (err) {
    console.error('❌ Socket auth failed: Invalid token');
    return next(new Error('Authentication error: Invalid token'));
  }
}

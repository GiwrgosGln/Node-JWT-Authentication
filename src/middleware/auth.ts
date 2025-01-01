import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  // Check cookie first for web apps
  const cookieToken = req.cookies.accessToken;

  // Check Authorization header for mobile apps
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.split(" ")[1];

  const accessToken = cookieToken || bearerToken;

  if (!accessToken) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

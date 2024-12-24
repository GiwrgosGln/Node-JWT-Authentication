import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserService } from "../services/userService";
import { AuthService } from "../services/authService";

const userService = new UserService();
const authService = new AuthService();

export class AuthController {
  private static generateTokens(user: any) {
    const accessToken = jwt.sign(
      { email: user.email },
      process.env.JWT_ACCESS_SECRET!,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { email: user.email },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken };
  }

  static async register(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const existingUser = await userService.findByEmail(email);

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await userService.create({ email, password: hashedPassword });

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await userService.findByEmail(email);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const { accessToken, refreshToken } = AuthController.generateTokens(user);

      // Store refresh token in database
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authService.storeRefreshToken(user.id, refreshToken, expiresAt);

      // Updated cookie settings that will work
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        message: "Login successful",
        user: { email: user.email },
      });
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  }
  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as any;
      const user = await userService.findByEmail(decoded.email);

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        AuthController.generateTokens(user);

      // Store new refresh token
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authService.storeRefreshToken(user.id, newRefreshToken, expiresAt);

      // Set new cookies
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 15 * 60 * 1000,
      });

      res.json({ message: "Tokens refreshed successfully" });
    } catch (error) {
      res.status(403).json({ message: "Invalid refresh token" });
    }
  }
  static async logout(req: Request, res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  }
}

import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../models/user";

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

      if (await User.findByEmail(email)) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({ email, password: hashedPassword });

      res.status(201).json({ message: "User created successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error creating user" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const { accessToken, refreshToken } = AuthController.generateTokens(user);

      // Store refresh token in cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      // Store access token in cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,

        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      });
      res.json({
        accessToken,
        refreshToken,
        message: "Login successful",
      });
    } catch (error) {
      res.status(500).json({ message: "Error logging in" });
    }
  }
  static async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token required" });
      }

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as any;
      const user = await User.findByEmail(decoded.email);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      const { accessToken, refreshToken: newRefreshToken } =
        AuthController.generateTokens(user);

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.json({
        accessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      res.status(401).json({ message: "Invalid refresh token" });
    }
  }

  static async logout(req: Request, res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  }
}

import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserService } from "../services/userService";
import { AuthService } from "../services/authService";
import { PasswordUtils } from "../utils/passwordUtils";

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

      const hashedPassword = await PasswordUtils.hashPassword(password);
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

      const validPassword = await PasswordUtils.verifyPassword(
        user.password,
        password
      );
      if (!validPassword) {
        return res.status(400).json({ message: "Invalid password" });
      }

      const { accessToken, refreshToken } = AuthController.generateTokens(user);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authService.storeRefreshToken(user.id, refreshToken, expiresAt);

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

      return res.status(200).json({
        accessToken,
        refreshToken,
        expiresIn: 900,
        refreshExpiresIn: 604800,
      });
    } catch (error) {
      return res.status(500).json({ message: "Error logging in" });
    }
  }

  static async refresh(req: Request, res: Response) {
    const cookieToken = req.cookies.refreshToken;
    const bodyToken = req.body.refreshToken;
    const refreshToken = cookieToken || bodyToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    try {
      const storedToken = await authService.findRefreshToken(refreshToken);
      if (!storedToken) {
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }

      await authService.invalidateRefreshToken(refreshToken);

      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET!
      ) as JwtPayload;
      const user = await userService.findByEmail(decoded.email);

      const { accessToken, refreshToken: newRefreshToken } =
        AuthController.generateTokens(user);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authService.storeRefreshToken(user.id, newRefreshToken, expiresAt);

      res.cookie("refreshToken", newRefreshToken, {
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

      return res.status(200).json({
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
        refreshExpiresIn: 604800,
      });
    } catch (error) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
  }

  static async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (refreshToken) {
        await authService.invalidateRefreshToken(refreshToken);
      }

      res.clearCookie("refreshToken");
      res.clearCookie("accessToken");

      return res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Error logging out" });
    }
  }
}

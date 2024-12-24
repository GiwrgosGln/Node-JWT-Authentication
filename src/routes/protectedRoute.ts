import { Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { AuthRequest } from "../types/auth";
import { Response } from "express";

const router = Router();

router.get(
  "/protected",
  authenticateToken as any,
  (req: AuthRequest, res: Response) => {
    const userEmail = req.user?.email;

    res.json({
      message: "You have access to this protected resource",
      user: userEmail,
    });
  }
);

export default router;

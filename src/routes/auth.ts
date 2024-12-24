import express, { Response } from "express";
import { AuthController } from "../controllers/authController";
import { AuthRequest } from "../types/auth";

const router = express.Router();

router.post("/register", AuthController.register as express.RequestHandler);
router.post("/login", AuthController.login as express.RequestHandler);
router.post("/refresh", AuthController.refresh as express.RequestHandler);
router.post("/logout", AuthController.logout);

const authHandler = (req: AuthRequest, res: Response) => {
  const user = req.user;
};

export default router;

import express from "express";
import { AuthController } from "../controllers/authController";

const router = express.Router();

router.post("/register", AuthController.register as express.RequestHandler);
router.post("/login", AuthController.login as express.RequestHandler);
router.post("/refresh", AuthController.refresh as express.RequestHandler);
router.post("/logout", AuthController.logout);
export default router;

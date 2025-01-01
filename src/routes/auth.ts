import express from "express";
import { AuthController } from "../controllers/authController";
import { validateRequest } from "../middleware/validateRequest";
import { loginSchema, registerSchema } from "../validators/authValidators";
import { authLimiter } from "../middleware/rateLimiter";

const router = express.Router();

router.post("/register", validateRequest(registerSchema), (req, res, next) => {
  AuthController.register(req, res).catch(next);
});

router.post(
  "/login",
  authLimiter,
  validateRequest(loginSchema),
  (req, res, next) => {
    AuthController.login(req, res).catch(next);
  }
);
router.post("/refresh", (req, res, next) => {
  AuthController.refresh(req, res).catch(next);
});
router.post("/logout", (req, res, next) => {
  AuthController.logout(req, res).catch(next);
});

export default router;

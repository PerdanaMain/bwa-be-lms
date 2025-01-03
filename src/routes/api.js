import express from "express";
import { signInAction, signUpAction } from "../controllers/auth.controller.js";
import { handlePayment } from "../controllers/payment.controller.js";
import { helloWorld } from "../controllers/global.controller.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import { verifyToken } from "../middlewares/verify-token.middleware.js";
import { exampleSchema, signInSchema, signUpSchema } from "../utils/schema.js";
import { getCourses } from "../controllers/course.controller.js";

const router = express.Router();

router.get("/hello-world", helloWorld);
router.post(
  "/test-validate",
  validateRequest(exampleSchema),
  async (req, res) => {
    return res.status(200).json({ message: "Valid Request" });
  }
);

// AUTH ROUTES
router.post("/sign-up", validateRequest(signUpSchema), signUpAction);
router.post("/sign-in", validateRequest(signInSchema), signInAction);

// COURSE ROUTES
router.get("/courses", verifyToken, getCourses);

// TRANSACTION ROUTES
router.post("/handle-payment-midtrans", handlePayment);

export default router;

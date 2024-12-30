import express from "express";
import { signUpAction } from "../controllers/auth.controller.js";
import { helloWorld } from "../controllers/global.controller.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import { exampleSchema, signUpSchema } from "../utils/schema.js";

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

export default router;

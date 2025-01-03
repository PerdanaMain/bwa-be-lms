import express from "express";
import { signInAction, signUpAction } from "../controllers/auth.controller.js";
import { handlePayment } from "../controllers/payment.controller.js";
import { helloWorld } from "../controllers/global.controller.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import { verifyToken } from "../middlewares/verify-token.middleware.js";
import { exampleSchema, signInSchema, signUpSchema } from "../utils/schema.js";
import { getCourses, postCourse } from "../controllers/course.controller.js";
import { fileFilter, fileStorageCourse } from "../utils/multer.js";
import multer from "multer";

const router = express.Router();
const upload = multer({
  storage: fileStorageCourse,
  fileFilter,
});

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
router.post("/courses", verifyToken, upload.single("thumbnail"), postCourse);

// TRANSACTION ROUTES
router.post("/handle-payment-midtrans", handlePayment);

export default router;

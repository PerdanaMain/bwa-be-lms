import express from "express";
import multer from "multer";
import { signInAction, signUpAction } from "../controllers/auth.controller.js";
import { getCourses, postCourse } from "../controllers/course.controller.js";
import { handlePayment } from "../controllers/payment.controller.js";
import { validateRequest } from "../middlewares/validate-request.middleware.js";
import { verifyToken } from "../middlewares/verify-token.middleware.js";
import { fileFilter, fileStorageCourse } from "../utils/multer.js";
import { signInSchema, signUpSchema } from "../utils/schema.js";
import {
  getCategories,
  postCategory,
} from "../controllers/category.controller.js";

const router = express.Router();
const upload = multer({
  storage: fileStorageCourse,
  fileFilter,
});

// AUTH ROUTES
router.post("/sign-up", validateRequest(signUpSchema), signUpAction);
router.post("/sign-in", validateRequest(signInSchema), signInAction);

// COURSE ROUTES
router.get("/courses", verifyToken, getCourses);
router.post("/courses", verifyToken, upload.single("thumbnail"), postCourse);

// CATEGORY ROUTES
router.get("/categories", getCategories);
router.post("/categories", postCategory);

// TRANSACTION ROUTES
router.post("/handle-payment-midtrans", handlePayment);

export default router;

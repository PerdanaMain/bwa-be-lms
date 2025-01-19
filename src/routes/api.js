import express from "express";
import multer from "multer";
import { signInAction, signUpAction } from "../controllers/auth.controller.js";
import {
  deleteCourse,
  getCourses,
  postCourse,
  updateCourse,
  getCourseById,
  postContentCourse,
  updateContentCourse,
} from "../controllers/course.controller.js";
import { mutateContentSchema } from "../utils/schema.js";
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
router.get("/courses/:id", verifyToken, getCourseById);
router.post("/courses", verifyToken, upload.single("thumbnail"), postCourse);
router.put(
  "/courses/:id",
  verifyToken,
  upload.single("thumbnail"),
  updateCourse
);
router.delete("/courses/:id", verifyToken, deleteCourse);

// CONTENT ROUTES
router.post(
  "/courses/content",
  verifyToken,
  validateRequest(mutateContentSchema),
  postContentCourse
);
router.put(
  "/courses/content/:id",
  verifyToken,
  validateRequest(mutateContentSchema),
  updateContentCourse
);

// CATEGORY ROUTES
router.get("/categories", getCategories);
router.post("/categories", postCategory);

// TRANSACTION ROUTES
router.post("/handle-payment-midtrans", handlePayment);

export default router;

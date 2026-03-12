import { authenticate, authorizeAdmin } from "@/middlewares/auth.middleware";
import express from "express";
import { feedbackSchema } from "@/lib/schemas/feedback.schema";
import { validateBody } from "@/lib/helpers/common.helper";
import { getAllUsers, getUserDetails, createFeedback, getAllFeedbacks } from "@/controllers/user.controller";

const router = express.Router();

router.get("/", authenticate, authorizeAdmin, getAllUsers)
// router.get("/:id", authenticate, getUserDetails);
router.post("/feedback", validateBody(feedbackSchema), createFeedback);
router.get("/feedback", getAllFeedbacks);

export { router as userRouter };

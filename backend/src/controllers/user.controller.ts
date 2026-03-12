import type { Response, Request } from "express";

import crypto from "crypto";
import { omitUserPrivateFields } from "@/lib/helpers/common.helper";
import { prisma } from "@/config/data-source";
import { feedbackSchema } from "@/lib/schemas/feedback.schema";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { orders: true },
    });
    const safeUsers = users.map((user:any) => omitUserPrivateFields(user));
    res.status(200).json({
      message: "Users fetched successfully.",
      data: safeUsers
    });
    return;
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      message: "Failed to retrieve users."
    });
    return;
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  const userId = req.params.id;
  if (!userId) {
    res.status(400).json({
      message: "Provide User ID to get User Details."
    });
    return;
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { orders: true },
    });
    if (!user) {
      res.status(404).json({
        message: "User not found."
      });
      return;
    }
    const response = {
      user: omitUserPrivateFields(user),
      orders: user.orders
    };
    res.status(200).json({
      message: "User details fetched successfully.",
      data: response
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Internal server error"
    });
    return;
  }
};

export const createFeedback = async (req: Request, res: Response) => {
  try {
    const result = feedbackSchema.safeParse(req.body);
    if (!result.success) {
       res.status(400).json({ message: result.error.errors[0]?.message || "Invalid input" });
       return;
    }
    const { rating, text } = result.data;
    // Optionally get user info from req.user if available, else from body
    const userName = req.body.userName || "Anonymous";
    const email = req.body.email || "";
    const feedback = await prisma.feedBack.create({
      data: {
        rating,
        text: text || "",
        userName,
        email,
      },
    });
     res.status(201).json({ message: "Feedback submitted successfully", data: feedback });
  } catch (error) {
     res.status(500).json({ message: "Failed to submit feedback" });
  }
};

export const getAllFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedBack.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
    });

     res.status(200).json({ message: "Feedbacks fetched successfully", data: feedbacks });
  } catch (error) {
    console.log(error)
     res.status(500).json({ message: "Failed to fetch feedbacks" });
  }
};





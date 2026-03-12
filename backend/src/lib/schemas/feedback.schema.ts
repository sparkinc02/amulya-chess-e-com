import { z } from "zod";

export const feedbackSchema = z.object({
  rating: z.number().min(1).max(5),
  text: z.string().max(300).optional(),
  userName: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

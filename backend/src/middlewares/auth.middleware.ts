import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "@/lib/helpers/auth.helper";
import { prisma } from "@/config/data-source";
import AppError from "@/lib/utils/appError";

//  Middleware to check if user is authenticated
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401)
      .set('X-Auth-Error', 'token-missing') // Custom header
      .json({ message: "Access token missing" });
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) {
      res.status(401)
        .set('X-Auth-Error', 'user-not-found') // Custom header
        .json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401)
      .set('X-Auth-Error', 'token-invalid') // Custom header
      .json({ message: "Invalid or expired token" });
    return;
  }
};
//  Middleware to authorize only admins
export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "admin") {

    res.status(403).json({ message: "Access denied. Admins only." });
    return;
  }

  next();
};
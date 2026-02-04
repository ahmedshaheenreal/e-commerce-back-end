import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { generateAccessToken } from "./generateToken";
import { accessCookieOptions } from "../constants";

dotenv.configDotenv();

export interface CustomRequest extends Request {
  token?: string | JwtPayload;
  cookies: { [key: string]: string };
}
export const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  // 🔴 No access token at all
  if (!accessToken) {
    if (!refreshToken) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    // let refresh logic handle it below
  }

  try {
    // ✅ Try normal verification
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET!,
    ) as JwtPayload;

    req.token = decoded;
    return next();
  } catch (err: any) {
    // 🔁 Access token expired → try refresh
    if (err instanceof jwt.TokenExpiredError) {
      try {
        if (!refreshToken) {
          res.status(401).json({ message: "Refresh token missing" });
          return;
        }

        const decodedRefresh = jwt.verify(
          refreshToken,
          process.env.JWT_SECRET!,
        ) as JwtPayload;

        const newAccessToken = generateAccessToken({
          id: decodedRefresh.id,
          role: decodedRefresh.role,
        });

        res.cookie("accessToken", newAccessToken, accessCookieOptions);

        // Attach decoded payload, NOT the raw token
        req.token = {
          id: decodedRefresh.id,
          role: decodedRefresh.role,
        };

        return next();
      } catch (refreshErr) {
        res.status(403).json({ message: "Invalid refresh token" });
        return;
      }
    }

    // ❌ Any other JWT error (missing / invalid)
    res.status(401).json({ message: "Invalid access token" });
    return;
  }
};

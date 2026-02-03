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
  const token = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  try {
    console.log(
      "VerifyToken Middleware: Checking authorization header... ACCESS TOKEN:",
      token,
    );
    if (!token) {
      console.log("NO TOKEN", token);
      res.status(401).json({ message: "Invalid access token" });
    }
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || "",
    ) as JwtPayload;
    req.token = decodedToken;

    return next();
  } catch (err: any) {
    if (err instanceof jwt.TokenExpiredError) {
      try {
        if (refreshToken) {
          const decodedrefresh = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET as string,
          );
          const newAccesstoken = generateAccessToken({
            id: (decodedrefresh as any)?.id,
            role: "user",
          });
          req.token = decodedrefresh;

          res.cookie("accessToken", newAccesstoken, accessCookieOptions);
          return next();
        }
      } catch (error) {
        console.log("There is a refresh: / new Error ", error.message);
        if (!refreshToken) {
          res.status(401).json({ message: "Refresh token missing" });
          return;
        }

        res.status(403).json({ message: "Invalid access token" });
        return;
      }
    }
  }
};

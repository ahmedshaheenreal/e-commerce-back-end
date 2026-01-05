import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.configDotenv();

export interface CustomRequest extends Request {
  token?: string | JwtPayload;
}

export const verifyToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("VerifyToken Middleware: Checking authorization header...");
    const token = req.cookies.accessToken;
    console.log("MYtoken", JSON.stringify(req.cookies));

    if (!token || token == "") {
      console.log("This is the missing token: ", token);
      console.log("VERIFY MIDDLEWARE:-- Authorization token is missing");
      throw new Error(
        "tokens missing, Please provide a valid authorization token"
      );
    }

    //parse the token string
    console.log("VerifyToken Middleware: Parsing token...");
    // const token = authHeader.replace("Bearer ", "");
    if (!token) {
      console.error("VerifyToken Error: Token is empty after parsing.");
      throw new Error("Token is empty after stripping Bearer");
    }

    //decode the token
    console.log("VerifyToken Middleware: Verifying token...");
    console.log(process.env.JWT_SECRET);
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || ""
    ) as JwtPayload;
    console.log("FECODE: ", decodedToken);
    // (req as CustomRequest).token = decodedToken
    // console.log("VerifyToken Middleware: Token verified successfully.");
    req.token = decodedToken;
    console.log(
      "VerifyToken Middleware: Token verified successfully. Decoded token:",
      decodedToken
    );

    next();
  } catch (err: any) {
    if (err instanceof jwt.JsonWebTokenError) {
      console.error("JWT Error :", err.message);
      res.status(403).json({ message: "Invalid token." });
      return;
    } else if (err instanceof jwt.TokenExpiredError) {
      console.error("JWT Expired Error:", err.message);
      res.status(403).json({ message: "Token expired." });
      return;
    } else {
      console.error("VerifyToken Middleware: Unexpected error:", err.message);
      res.status(403).json({ message: err.message });
      return;
    }
  }
};

import { Request, Response, NextFunction } from "express";
import UserService from "../services/userServices";
import { accessCookieOptions, refreshCookieOptions } from "../constants";
import {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken";
import { configDotenv } from "dotenv";
import {
  validateUserSignUp,
  validateMerchantSignUp,
  validateLoginUser,
} from "../utils/validateUser";
import MerchantService from "../services/merchantService";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../utils/verifyToken";
import { JwtPayload } from "jsonwebtoken";

export interface AuthJwtPayload extends JwtPayload {
  id: number;
  role: "user" | "merchant";
}
configDotenv();

export const refreshController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  //this will send an access token if the provided refresh token is valid

  try {
    const refreshToken = req.cookies.refreshToken;
    console.log("REFRESH TOKEN ", refreshToken);
    if (!refreshToken || refreshToken === "") {
      res.status(401).json({ message: "Please Log in, no token provided" });
      return;
    }
    const { id, role } = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET || "secret",
    ) as AuthJwtPayload;

    const payload = {
      id,
      role,
    };
    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);
    //Rotation logic start

    //ROtation Logic End
    console.log("new access TOKKEN", accessToken);
    res
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
      .status(200)
      .json({ success: true, accessToken });
    console.log("RESPONSE COOKIE::", res);
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      console.error("JWT Error :", err.message);
      res.status(403).json({ message: "Invalid token." });
    } else if (err instanceof jwt.TokenExpiredError) {
      console.error("JWT Expired Error:", err.message);
      res.status(403).json({ message: "Token expired." });
    } else {
      console.error("VerifyToken Middleware: Unexpected error:", err.message);
      res.status(500).json({ message: "Internal server error." });
    }
  }
};

export const logOut = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res
      .clearCookie("accessToken")
      .clearCookie("refreshTOken")
      .status(203)
      .json({ success: true });
    console.log("LOGGEd OUT");
  } catch (error) {
    res.status(500).json({ error });
    console.error(error);
  }
};

export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let result: any; //mercahnt or user object

    if (req.body.role === "user") {
      //validation logic

      const { value, error } = validateUserSignUp(req.body);

      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      //make sure user does not exist
      if (await UserService.findUserByEmail(value.email)) {
        res.status(400).json({
          success: false,
          message: "User already exists, please login.",
        });
        return;
      }
      //create user
      const user = await UserService.createUser(value);
      if (!user) {
        throw new Error("Internal server Error");
      }
      result = user;
    } else if (req.body.role === "merchant") {
      //validation logic
      const { value, error } = validateMerchantSignUp(req.body);
      if (error) {
        res.status(400).json({ error });
        return;
      }
      //make sure merchant does not exist
      if (await MerchantService.findMerchantByEmail(value.email)) {
        res.status(400).json({
          success: false,
          message: "User already exists, please login.",
        });
        return;
      }
      const merchant = await MerchantService.createUser(value);
      if (!merchant) {
        throw new Error("Internal server Error");
      }
      result = merchant;
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid role. Role must be 'user' or 'merchant'.",
      });
      return;
    }

    //generate token
    const accessToken = generateAccessToken({
      id: result.user_id || result.merchant_id,
      role: req.body.role,
    });
    const refreshToken = generateRefreshToken({
      id: result.user_id || result.merchant_id,
      role: req.body.role,
    });

    //send back to the user
    res
      .status(201)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json({
        success: true,
        role: req.body.role,
      });
    console.log({ success: true, role: req.body.role });
    return;
    // res.status(201).json({
    //   success: true,
    //   token,
    // })
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { value, error } = validateLoginUser(req.body);

  if (error) {
    res.status(400).json({ error });

    return;
  }

  const user = await UserService.findUserByEmail(value.email);

  if (!user) {
    res.status(404).send("your email or password ");
  } else {
    const payload = {
      id: user.dataValues?.user_id,
      role: value.role,
    };

    //check if the password is correct
    if (await bcrypt.compare(value.password, user.dataValues?.password)) {
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);
      res
        .status(200)
        .cookie("accessToken", accessToken, accessCookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .json({ success: true });
    } else {
      res.status(400).json({
        message: "your password is wrong",
      });
    }
  }
};

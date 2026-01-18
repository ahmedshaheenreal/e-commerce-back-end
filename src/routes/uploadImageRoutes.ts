import express from "express";
import {
  uploadImage,
  uploadProfileImage,
} from "../controllers/uploadImageController";
import multer from "multer";
import { upload } from "../middleware/multer";
import { verifyToken } from "../utils/verifyToken";

export const imageRouter = express.Router();

imageRouter.post("/upload", verifyToken, upload.single("image"), uploadImage);

imageRouter.post(
  "/upload-profile-pic",
  verifyToken,
  upload.single("image"),
  uploadProfileImage,
);

import express from "express";
import dotenv from "dotenv";
import { Admin } from "./models/AdminModel";
import { sequelize, connectToDB } from "./config/db";
import { setupAssociations } from "./models/associations";
import { productRoutes } from "./routes/productRoutes";
import merchantRoutes from "./routes/merchantRoutes";
import { invalidRoute, invalidJSON } from "./middleware/errorHandler";
import profileRoutes from "./routes/profileRoutes";
import authRouter from "./routes/authRoutes";
import checkoutRoutes from "./routes/checkoutRoutes";
import { imageRouter } from "./routes/uploadImageRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";

import cartRouter from "./routes/cartRoutes";
import { ratingRouter } from "./routes/ratingRoutes";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swaggerConfig";
import cors from "cors";
import cookieParser from "cookie-parser";
dotenv.config();

// dotenv.configDotenv();

export const app = express();

const corsOptions = {
  origin: [
    "https://shaheenshop.online",
    "https://coaral.netlify.app",
    "http://localhost:3000",
  ], // your frontend URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if using cookies or auth headers
};
app.set("trust proxy", 1);

app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
const PORT = Number(process.env.PORT) || 3000;
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", productRoutes);
app.use("/api/", merchantRoutes);
app.use("/api", imageRouter);
app.use("/api/wishlist", wishlistRoutes);

app.use("/api/user", profileRoutes);
app.use("/api", checkoutRoutes);
// app.use("/api", authRoutes);

app.use("/api", authRouter);
app.use("/api/cart", cartRouter);
app.use("/api/rating", ratingRouter);

// Middleware to handle invalid routes
app.use(invalidRoute);

// Middleware to handle invalid JSON structure
app.use(invalidJSON);

app.listen(PORT, async () => {
  // To create the tables, you need to convert the commented lines into normal code:

  // console.log("Connecting to DB...");

  await connectToDB();
  console.log("Connected to DB successfully.");
  console.log("Setting up associations...");
  setupAssociations();
  console.log("Associations are set up.");
  console.log("Syncing Sequelize...");
  await sequelize.sync({ alter: true });
  console.log("Sequelize has been synced.");
  console.log("Syncing Admin model...");

  // await Admin.sync({ force: true });
  // console.log("Admin model has been synced.");

  console.log(`Server is running on port ${PORT}`);
});

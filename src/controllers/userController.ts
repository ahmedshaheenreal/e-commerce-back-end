import { Request, Response, NextFunction } from "express";
import UserService from "../services/userServices";
import bcrypt from "bcrypt";
import dayjs from "dayjs";
import { validateUserUpdate } from "../utils/validateUser";

export const updateUserInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = req.body;
    console.log(user);

    const { error } = validateUserUpdate(user);
    user.user_id = (req as any).token.id;
    if (error) {
      res.status(400).json(error);
      return;
    }

    const count = await UserService.updateuserInfo(user);
    if (count === 0) {
      res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({ message: "User Updated Successfully" });
    console.log("User Updated Successfully");
  } catch (error) {
    res.status(500).json("Server Error");
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    console.log("Fetching profile for authenticated user...");

    // Extract userId from token
    const userId = (req as any).token.id;

    console.log("Authenticated user ID:", userId);

    // Fetch user from database
    const user = await UserService.getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Respond with user profile data
    res.status(200).json({
      id: user.user_id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      profilePicture: user.profilePicture,
      address: user.address,
      // lastPasswordChange: user.lastPasswordChange,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching user profile:", error.message);
    } else {
      console.error("Error fetching user profile:", error);
    }
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updatePassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as any).token.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Check if newPassword matches confirmPassword
    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match." });
      return;
    }
    //check if all fields are provided
    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ message: "All fields are required." });
      return;
    }

    //fetch the user from the database
    const user = await UserService.getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    /// Check the last password change date to implement rate limiting
    if (user.lastPasswordChange) {
      const now = dayjs();
      const lastPasswordChange = dayjs(user.lastPasswordChange);
      const hoursSinceLastChange = now.diff(lastPasswordChange, "hour");

      console.log(`Hours since last password change: ${hoursSinceLastChange}`);

      if (hoursSinceLastChange < 24) {
        console.log(
          "Password change rate limiting enforced. Less than 24 hours since last change.",
        );
        res.status(429).json({
          message: "Password can only be changed once every 24 hours.",
        });
        return;
      }
    } else {
      console.log("No lastPasswordChange recorded, allowing password change.");
    }

    //verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      res.status(401).json({ message: "Current password is incorrect." });
      return;
    }

    //update the password in the database
    await UserService.updateUserPassword(userId, newPassword);

    // //update the lastPasswordChange timestamp
    // await UserService.updateLastPasswordChange(userId);

    //respond to the client
    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

import { User, UserCreationAttributes } from "../models/UserModel";
import { sendPasswordChangeEmail } from "../utils/emailService";

export default class UserService {
  static async findUserByEmail(email: string) {
    console.log("UserService: Searching for user by email:", email);

    try {
      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (user) {
        console.log("UserService: User found:", user.dataValues);
      } else {
        console.log("UserService: No user found with email:", email);
      }

      return user;
    } catch (error) {
      console.error(
        "UserService: Error querying user by email:",
        (error as Error).message
      );
      throw error;
    }
  }

  static async createUser(user: Omit<UserCreationAttributes, "role">) {
    const result = await User.create(user);
    return result;
  }

  static async getUserById(id: number) {
    const user = await User.findOne({
      where: {
        user_id: id,
      },
      attributes: [
        "user_id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "dateOfBirth",
        "password",
        "address",
        "profilePicture",
        "lastPasswordChange",
      ],
    });

    return user;
  }

  static async updateUserPassword(userId: number, newPassword: string) {
    const user = await User.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    user.password = newPassword; //assign the hashwd password directly

    console.log("Updating lastPasswordChange to:", new Date());
    user.lastPasswordChange = new Date();
    await user.save(); //save the changes
    console.log("Updated user after password change:", user);
    console.log("Updated lastPasswordChange:", user.lastPasswordChange); // Log for verification

    await sendPasswordChangeEmail(
      user.email,
      `${user.firstName} ${user.lastName}`
    );
  }

  static async updateuserInfo(user: any) {
    const [updatedCount] = await User.update(user, {
      where: {
        user_id: user.user_id,
      },
    });
    return updatedCount;
  }
  static async updateUserAddress(userId: number, address: string) {
    try {
      const user = await User.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found.`);
      }

      // Update the user's address
      user.address = address;
      await user.save(); // Save the updated information in the database
      console.log("User address updated:", user);
      return user;
    } catch (error) {
      console.error("Error updating user address:", error);
      throw error;
    }
  }
}

import { Request, Response, NextFunction } from "express";

import UserService from "../services/userServices";
import { sequelize } from "../config/db";
import { Product } from "../models/ProductModel";
import { CartItem } from "../models/CartItemModel";
import { productService } from "../services/productService";
import { orderService } from "../services/orderService";
import { OrderItem } from "../models/OrderItem";
import { orderItemService } from "../services/orderItemService";
import { Sequelize, Transaction } from "sequelize";
import { stripe } from "../config/stripe";
import CartService from "../services/cartServices";
import { configDotenv } from "dotenv";
configDotenv();
export const getCheckoutInfo = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Log the request to see where the token is located
    console.log("Request Object:", req);
    // Get the user ID from the request token (assuming authentication middleware is in place)
    const userId = (req as any).token?.id;
    if (!userId) {
      res
        .status(401)
        .json({ message: "Unauthorized, no valid user ID found." });
      return;
    }
    // Fetch user data using UserService
    const user = await UserService.getUserById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // Prepare the required user information for checkout
    const checkoutInfo = {
      //   id: user.user_id,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
    };

    // Send the response back to the client
    res.status(200).json(checkoutInfo);
  } catch (error) {
    console.error("Error fetching checkout information:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const updateUserAddress = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = (req as any).token?.id;

    if (!userId) {
      res
        .status(401)
        .json({ message: "Unauthorized, no valid user ID found." });
      return;
    }

    // Extract the new address from the request body
    const { address } = req.body;

    // Validate that the address is provided
    if (!address) {
      res.status(400).json({ message: "Address is required." });
      return;
    }

    // Update the user's address using the UserService
    const updatedUser = await UserService.updateUserAddress(userId, address);

    // Respond with a success message and updated user data
    res
      .status(200)
      .json({ message: "Address updated successfully.", user: updatedUser });
  } catch (error) {
    console.error("Error updating user address:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const checkoutHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user_id = (req as any).token.id;

  try {
    // Create Stripe session FIRST (before transaction)
    const cart = await CartService.getUserCart(user_id);
    console.log("cart in checkout handler: ", cart);
    const lineItems = cart.cartItems.map((product: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.dataValues.product.dataValues.name,
        },
        unit_amount: Math.round(
          product.dataValues.product.dataValues.price_after_discount * 100,
        ),
      },
      quantity: product.dataValues.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${process.env.CLIENT_URL}/my-orders`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    // THEN start transaction for DB operations
    const transaction = await sequelize.transaction();

    try {
      const order = (
        await orderService.createOrder(
          user_id,
          cart.totalPriceAfterDiscount,
          1,
          transaction,
        )
      ).dataValues;
      console.log("order created: ", order);
      await orderItemService.addOrderItemsFromCart(
        (order as any).order_id,
        cart.cartItems,
        transaction,
      );
      await CartService.clearCart(user_id, transaction);

      await transaction.commit();
    } catch (error) {
      console.log("inner transaction Rolled Back error: ", error);
      await transaction.rollback();
      throw error;
    }

    res.json({ url: session.url });
  } catch (error) {
    console.log("checkout error: ", error);
    next(error);
  }
};
export const orderHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("ORDER HISTORY CONTROLLER");
    const user_id = (req as any).token.id;
    const orders = await orderService.getAllOrders(user_id);
    res.status(200).json(orders);
  } catch (error) {
    console.log("ERROR ORDER HISTORY CONTROLLER", error);

    res.status(500).json({
      status: "error",
      message: error.message,
      details: error,
    });
  }
};

export const orderDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const order_id = parseInt(req.params.order_id);
    const user_id = (req as any).token.id;

    if (!order_id) throw new Error("no order id provided");

    const orderItems = await productService.getOrderProducts(order_id, user_id);

    res.status(200).json(orderItems);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      details: error,
    });
  }
};

// Simulate a payment function
function simulatePayment(amount: number): boolean {
  return Math.random() > 0.2;
}

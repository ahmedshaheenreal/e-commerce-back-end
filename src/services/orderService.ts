import { Transaction } from "sequelize";
import { Order } from "../models/Order";

export class orderService {
  static async createOrder(
    user_id: number,
    total: number,
    status: number,
    transaction?: Transaction,
  ) {
    const order = await Order.create(
      {
        user_id,
        status,
        total,
      },
      { transaction, raw: true },
    );
    return order;
  }

  static async getAllOrders(user_id: number) {
    console.log(
      "ORDER SERVICE/ ALL ORDERS / Fetching orders for user_id:",
      user_id,
    );
    const orders = await Order.findAll({
      where: {
        user_id,
      },
    });

    return orders;
  }
}

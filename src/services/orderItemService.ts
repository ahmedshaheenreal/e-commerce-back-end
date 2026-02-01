import { Transaction } from "sequelize";

import { OrderItem } from "../models/OrderItem";

export class orderItemService {
  // create multible  items
  static async addOrderItemsFromCart(
    order_id: number,
    items: any,
    transaction: Transaction,
  ) {
    const cart = items.map((item: any) => ({
      quantity: item.dataValues.quantity,
      order_id,
      product_id: item.dataValues.product_id,
    }));

    console.log("order items to be created: ", cart);
    const orderItems = await OrderItem.bulkCreate(cart, {
      transaction,
    });
    console.log("created order items: ", orderItems);

    return orderItems;
  }
}

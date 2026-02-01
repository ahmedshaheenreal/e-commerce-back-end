import express from "express";
import { Router } from "express";
import {
  getCheckoutInfo,
  updateUserAddress,
  checkoutHandler,
  orderDetails,
  orderHistory,
} from "../controllers/checkoutController";
import { verifyToken } from "../utils/verifyToken";

const router = express.Router();

// New route for getting checkout info
router.get("/checkout-info", verifyToken, getCheckoutInfo);

router.put("/checkout-update-address", verifyToken, updateUserAddress);

// export const checkoutRoutes = express.Router();

router.post("/checkout-payment", verifyToken, checkoutHandler);
router.get("/checkout-order-history", verifyToken, orderHistory);
router.get("/checkout-order-details/:order_id", verifyToken, orderDetails);

export default router;

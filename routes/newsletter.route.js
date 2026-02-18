import express from "express";
import {
  getAllSubscribers,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from "../controllers/newsletter.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import verifyToken from "../middleware/verifyToken.js";

const newsletterRouter = express.Router();

// Public
newsletterRouter.post("/subscribe", subscribeNewsletter);
newsletterRouter.post("/unsubscribe", unsubscribeNewsletter);

// Admin (protect with middleware if needed)
newsletterRouter.get(
  "/newsletters",
  verifyToken,
  verifyAdmin,
  getAllSubscribers,
);

export default newsletterRouter;

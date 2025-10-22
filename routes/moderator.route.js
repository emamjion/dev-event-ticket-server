import express from "express";
import { updateModeratorProfile } from "../controllers/moderator.controller.js";
import verifyModerator from "../middleware/verifyModerator.js";
import verifyToken from "../middleware/verifyToken.js";

const moderatorRouter = express.Router();

moderatorRouter.put(
  "/update-profile",
  verifyToken,
  verifyModerator,
  updateModeratorProfile
);

export default moderatorRouter;

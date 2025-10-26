import express from "express";
import {
  addModeratorToEvent,
  getEventModerators,
  loginModerator,
  removeModeratorFromEvent,
  updateModeratorProfile,
} from "../controllers/moderator.controller.js";
import { scanTicket } from "../controllers/scanTicket.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import verifyModerator from "../middleware/verifyModerator.js";
import verifyToken from "../middleware/verifyToken.js";

const moderatorRouter = express.Router();

moderatorRouter.post("/login", loginModerator);

moderatorRouter.put(
  "/update-profile",
  verifyToken,
  verifyModerator,
  updateModeratorProfile
);

moderatorRouter.post(
  "/:eventId/addModerator",
  verifyToken,
  verifyAdmin,
  addModeratorToEvent
);
moderatorRouter.delete(
  "/:eventId/removeModerator",
  verifyToken,
  verifyAdmin,
  removeModeratorFromEvent
);
moderatorRouter.get(
  "/:eventId/moderators",
  verifyToken,
  verifyAdmin,
  getEventModerators
);

moderatorRouter.post("/scan-ticket", verifyToken, verifyModerator, scanTicket);

export default moderatorRouter;

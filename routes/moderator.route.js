import express from "express";
import {
  addModeratorToEvent,
  getEventModerators,
  removeModeratorFromEvent,
  updateModeratorProfile,
} from "../controllers/moderator.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import verifyModerator from "../middleware/verifyModerator.js";
import verifyToken from "../middleware/verifyToken.js";

const moderatorRouter = express.Router();

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

export default moderatorRouter;

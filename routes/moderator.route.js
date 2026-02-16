import express from "express";
import {
  createModeratorAndAssignToEvent,
  getEventModerators,
  loginModerator,
  removeModeratorFromEvent,
  updateModeratorProfile,
} from "../controllers/moderator.controller.js";
import {
  getRecentScans,
  getTodayStats,
} from "../controllers/scanLog.controller.js";
import { getScannedTicketsByModerator } from "../controllers/scanTicket.controller.js";
import { scanTicket } from "../controllers/ticketScanRecord.controller.js";
import verifyAdmin from "../middleware/verifyAdmin.js";
import verifyModerator from "../middleware/verifyModerator.js";
import verifyToken from "../middleware/verifyToken.js";

const moderatorRouter = express.Router();

moderatorRouter.post("/login", loginModerator);

moderatorRouter.put(
  "/update-profile",

  verifyModerator,
  updateModeratorProfile,
);

moderatorRouter.post(
  "/:eventId/create-moderator",
  verifyToken,
  verifyAdmin,
  createModeratorAndAssignToEvent,
);
moderatorRouter.delete(
  "/:eventId/removeModerator",

  verifyAdmin,
  removeModeratorFromEvent,
);
moderatorRouter.get(
  "/:eventId/moderators",

  verifyAdmin,
  getEventModerators,
);

// moderatorRouter.post("/scan-ticket", verifyToken, verifyModerator, scanTicket);

// temporary scan tracking system
moderatorRouter.post("/scan-ticket", verifyModerator, scanTicket);

moderatorRouter.get(
  "/scanned/:moderatorId",
  verifyModerator,
  getScannedTicketsByModerator,
);

moderatorRouter.get(
  "/stats/:moderatorId",

  verifyModerator,
  getTodayStats,
);

moderatorRouter.get(
  "/recent/:moderatorId",

  verifyModerator,
  getRecentScans,
);

export default moderatorRouter;

import mongoose from "mongoose";

const ticketScanRecordSchema = new mongoose.Schema({
  ticketCode: String,
  scannedAt: { type: Date, default: Date.now },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export const TicketScanRecord =
  mongoose.models.TicketScanRecord ||
  mongoose.model("TicketScanRecord", ticketScanRecordSchema);

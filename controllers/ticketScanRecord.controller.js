import OrderModel from "../models/orderModel.js";
import { TicketScanRecord } from "../models/ticketScanRecord.model.js";
import UserModel from "../models/userModel.js";

const scanTicket = async (req, res) => {
  try {
    const { ticketCode, moderatorId } = req.body;

    if (!ticketCode || !moderatorId) {
      return res.status(400).json({
        success: false,
        message: "ticketCode and moderatorId are required.",
      });
    }

    // Moderator validation
    const moderator = await UserModel.findOne({
      _id: moderatorId,
      role: "moderator",
    });

    if (!moderator) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only moderators can scan tickets.",
      });
    }

    // Find order with nested ticketCodes.code
    const order = await OrderModel.findOne({
      "ticketCodes.code": ticketCode,
    })
      .populate("buyerId", "name email contactNumber")
      .populate("eventId", "title name date time location");

    if (!order) {
      await TicketScanRecord.create({
        ticketCode,
        scannedBy: moderatorId,
        status: "invalid",
      });

      return res.status(404).json({
        success: false,
        status: "invalid",
        message: "Invalid ticket code.",
      });
    }

    // Find the specific ticket object
    const ticketObj = order.ticketCodes.find((t) => t.code === ticketCode);

    if (!ticketObj) {
      return res.status(404).json({
        success: false,
        status: "invalid",
        message: "Ticket code not found inside order.",
      });
    }

    // Check previous scans for this exact ticketCode
    const previousScans = await TicketScanRecord.countDocuments({
      ticketCode,
      status: "valid",
    });

    // If already used
    if (previousScans >= 1) {
      await TicketScanRecord.create({
        ticketCode,
        scannedBy: moderatorId,
        status: "used",
      });

      return res.status(200).json({
        success: true,
        status: "used",
        message: "This ticket has already been used.",
        ticketCode,
      });
    }

    // Save valid scan
    await TicketScanRecord.create({
      ticketCode,
      scannedBy: moderatorId,
      status: "valid",
    });

    // Count all scanned seats for this order
    const totalUsedSeats = await TicketScanRecord.countDocuments({
      ticketCode,
      status: "valid",
    });

    // Final response
    res.status(200).json({
      success: true,
      status: "valid",
      message: "Ticket verified successfully - entry granted.",
      verificationResult: {
        status: "valid",
        buyer: {
          name: order.buyerId?.name,
          email: order.buyerId?.email,
          contactNumber: order.buyerId?.contactNumber,
        },
        event: {
          title: order.eventId?.title || order.eventId?.name,
          date: order.eventId?.date,
          time: order.eventId?.time,
          location: order.eventId?.location,
        },
        scanTime: new Date(),
        scannedBy: moderator.name,
        ticketCode,
      },
    });
  } catch (error) {
    console.error("🎫 Ticket Scan Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while scanning ticket.",
      error: error.message,
    });
  }
};

export { scanTicket };

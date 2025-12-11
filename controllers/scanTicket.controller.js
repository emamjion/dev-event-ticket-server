import OrderModel from "../models/orderModel.js";
import ScanLogModel from "../models/scanLog.model.js";
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

    // Validate moderator
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

    // FIND order containing this ticketCode
    const order = await OrderModel.findOne({
      "ticketCodes.code": ticketCode,
    })
      .populate("buyerId", "name email")
      .populate("eventId", "title name date time location");

    if (!order) {
      await ScanLogModel.create({
        ticketCode,
        moderatorId,
        status: "invalid",
      });

      return res.status(404).json({
        success: false,
        status: "invalid",
        message: "Invalid ticket code. No matching order found.",
        verificationResult: {
          status: "invalid",
          message: "No order found for this ticket code.",
          scannedBy: moderator.name,
          ticketCode,
        },
      });
    }

    // Check which ticket seat object matched
    const ticketObj = order.ticketCodes.find((t) => t.code === ticketCode);

    if (!ticketObj) {
      return res.status(404).json({
        success: false,
        status: "invalid",
        message: "Ticket code not found inside this order.",
      });
    }

    // Already used?
    if (ticketObj.isUsed) {
      await ScanLogModel.create({
        ticketCode,
        moderatorId,
        orderId: order._id,
        status: "used",
      });

      return res.status(200).json({
        success: true,
        status: "used",
        message: "This ticket has already been used.",
        verificationResult: {
          status: "used",
          buyer: {
            name: order.buyerId?.name,
            email: order.buyerId?.email,
          },
          event: {
            title: order.eventId?.title || order.eventId?.name,
            date: order.eventId?.date,
            time: order.eventId?.time,
            location: order.eventId?.location,
          },
          scannedBy: moderator.name,
          ticketCode,
        },
      });
    }

    // Mark this specific ticket as used
    ticketObj.isUsed = true;
    ticketObj.scannedAt = new Date();
    ticketObj.scannedBy = moderatorId;

    await order.save();

    await ScanLogModel.create({
      ticketCode,
      moderatorId,
      orderId: order._id,
      status: "valid",
    });

    res.status(200).json({
      success: true,
      status: "valid",
      message: "Ticket verified successfully - entry granted.",
      verificationResult: {
        status: "valid",
        buyer: {
          name: order.buyerId?.name,
          email: order.buyerId?.email,
        },
        event: {
          title: order.eventId?.title || order.eventId?.name,
          date: order.eventId?.date,
          time: order.eventId?.time,
          location: order.eventId?.location,
        },
        scannedBy: moderator.name,
        ticketCode,
      },
    });
  } catch (error) {
    console.error("🎫 Ticket Scan Error:", error);
    res.status(500).json({
      success: false,
      status: "error",
      message: "Server error while scanning ticket.",
      error: error.message,
    });
  }
};

const getScannedTicketsByModerator = async (req, res) => {
  try {
    const moderatorId = req.params.moderatorId;

    const moderator = await UserModel.findOne({
      _id: moderatorId,
      role: "moderator",
    });

    if (!moderator) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only moderators can view scanned tickets.",
      });
    }

    // Find orders that have at least one scanned ticket by this moderator
    const orders = await OrderModel.find({
      "ticketCodes.scannedBy": moderatorId,
    })
      .populate("eventId", "name date time location")
      .populate("buyerId", "name email")
      .sort({ "ticketCodes.scannedAt": -1 });

    const tickets = [];

    orders.forEach((order) => {
      order.ticketCodes.forEach((t) => {
        if (t.isUsed && t.scannedBy?.toString() === moderatorId) {
          tickets.push({
            ticketCode: t.code,
            eventName: order.eventId?.name,
            eventDate: order.eventId?.date,
            location: order.eventId?.location,
            buyerName: order.buyerId?.name,
            buyerEmail: order.buyerId?.email,
            scannedAt: t.scannedAt,
          });
        }
      });
    });

    res.status(200).json({
      success: true,
      count: tickets.length,
      message: "Scanned tickets fetched successfully",
      tickets,
    });
  } catch (error) {
    console.error("Error fetching scanned tickets:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching scanned tickets.",
      error: error.message,
    });
  }
};

export { getScannedTicketsByModerator, scanTicket };

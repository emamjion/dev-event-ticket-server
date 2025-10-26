import OrderModel from "../models/orderModel.js";
import UserModel from "../models/userModel.js";

/*
const scanTicket = async (req, res) => {
  try {
    const { ticketCode, moderatorId } = req.body;

    if (!ticketCode || !moderatorId) {
      return res.status(400).json({
        success: false,
        message: "ticketCode and moderatorId are required",
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
        message: "Unauthorized: Only moderators can scan tickets",
      });
    }

    // Find the order using ticketCode
    const order = await OrderModel.findOne({ ticketCode });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Invalid ticket code",
      });
    }

    // Check if already used
    if (order.isUsed) {
      return res.status(400).json({
        success: false,
        message: "This ticket has already been used",
        scannedAt: order.scannedAt,
      });
    }

    // ✅ Mark as used
    order.isUsed = true;
    order.scannedAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Ticket scanned successfully",
      ticketInfo: {
        orderId: order._id,
        buyerId: order.buyerId,
        eventId: order.eventId,
        scannedAt: order.scannedAt,
        moderator: moderator.name,
      },
    });
  } catch (error) {
    console.error("Scan Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during scanning",
      error: error.message,
    });
  }
};
*/

const scanTicket = async (req, res) => {
  try {
    const { ticketCode, moderatorId } = req.body;

    if (!ticketCode || !moderatorId) {
      return res.status(400).json({
        success: false,
        message: "ticketCode and moderatorId are required.",
      });
    }

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

    const order = await OrderModel.findOne({ ticketCode });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Invalid ticket code. No matching order found.",
      });
    }

    // 🔹 If already scanned
    if (order.isUsed) {
      return res.status(200).json({
        success: true,
        status: "used",
        message: "This ticket has already been used.",
        scannedAt: order.scannedAt,
        scannedBy: order.scannedBy,
      });
    }

    // 🔹 Mark ticket as valid & used
    order.isUsed = true;
    order.scannedAt = new Date();
    order.scannedBy = moderatorId;

    await order.save();

    // ✅ Response
    res.status(200).json({
      success: true,
      status: "valid",
      message: "Ticket scanned successfully. Marked as used.",
      ticket: {
        orderId: order._id,
        eventId: order.eventId,
        buyerId: order.buyerId,
        scannedAt: order.scannedAt,
        moderator: moderator.name,
        ticketCode: order.ticketCode,
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

export { scanTicket };

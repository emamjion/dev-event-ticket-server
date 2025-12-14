import OrderModel from "../models/orderModel.js";
import SellerModel from "../models/sellerModel.js";
import { TicketScanRecord } from "../models/ticketScanRecord.model.js";
import UserModel from "../models/userModel.js";

const generateSalesReport = async (req, res) => {
  try {
    const soldOrders = await OrderModel.find({
      paymentStatus: "success",
    })
      .populate("eventId", "title name date time location")
      .populate("sellerId", "name organizationName email contactNumber")
      .populate("buyerId", "name email contactNumber");

    const totalRevenue = soldOrders.reduce(
      (total, order) => total + order.totalAmount,
      0
    );

    const ordersWithScanStatus = await Promise.all(
      soldOrders.map(async (order) => {
        const ticketCodes = order.ticketCodes?.map((t) => t.code) || [];

        const scanRecords = await TicketScanRecord.find({
          ticketCode: { $in: ticketCodes },
        });

        const ticketScanMap = {};

        scanRecords.forEach((record) => {
          if (!ticketScanMap[record.ticketCode]) {
            ticketScanMap[record.ticketCode] = record.status;
          } else if (record.status === "used") {
            ticketScanMap[record.ticketCode] = "used";
          }
        });

        const ticketScanDetails = order.ticketCodes.map((ticket) => ({
          code: ticket.code,
          status: ticketScanMap[ticket.code] || "not_scanned",
        }));

        const totalTickets = ticketScanDetails.length;
        const validCount = ticketScanDetails.filter(
          (t) => t.status === "valid"
        ).length;
        const usedCount = ticketScanDetails.filter(
          (t) => t.status === "used"
        ).length;

        let scanStatus = "not_scanned";

        if (usedCount > 0) {
          scanStatus = "used";
        } else if (validCount === totalTickets && totalTickets > 0) {
          scanStatus = "fully_scanned";
        } else if (validCount > 0) {
          scanStatus = "partially_scanned";
        }

        return {
          ...order.toObject(),
          scanStatus,
          ticketScanDetails,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Sales report generated successfully",
      totalSales: soldOrders.length,
      totalRevenue,
      orders: ordersWithScanStatus,
    });
  } catch (error) {
    console.error("Error generating sales report:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate sales report",
      error: error.message,
    });
  }
};

// User report controller function
const generateUserReport = async (req, res) => {
  try {
    const totalUsers = await UserModel.countDocuments();
    const totalSellers = await SellerModel.countDocuments();

    const soldOrders = await OrderModel.find({
      paymentStatus: "success",
    }).select("buyerId");

    const buyerIdSet = new Set(
      soldOrders.map((order) => order.buyerId.toString())
    );
    const buyerIds = [...buyerIdSet];

    const buyers = await UserModel.find({ _id: { $in: buyerIds } }).select(
      "name email contactNumber"
    );

    res.status(200).json({
      success: true,
      message: "User report generated successfully",
      totalUsers,
      totalSellers,
      totalBuyers: buyers.length,
      buyers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate user report",
      error: error.message,
    });
  }
};

// Transaction report controller function
const generateTransactionReport = async (req, res) => {
  try {
    const successPayments = await OrderModel.countDocuments({
      paymentStatus: "success",
    });
    const pendingPayments = await OrderModel.countDocuments({
      paymentStatus: "pending",
    });
    const failedPayments = await OrderModel.countDocuments({
      paymentStatus: "failed",
    });

    res.status(200).json({
      success: true,
      message: "Transaction report generated successfully",
      successPayments,
      successPaymentsNumber: successPayments.length,
      pendingPayments,
      pendingPaymentsNumber: pendingPayments.length,
      failedPayments,
      failedPaymentsNumber: failedPayments.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate transaction report",
      error: error.message,
    });
  }
};

export { generateSalesReport, generateTransactionReport, generateUserReport };

import mongoose from "mongoose";

const ticketCodeSchema = new mongoose.Schema({
  seatNumber: Number,
  section: String,
  row: String,
  code: {
    type: String,
    unique: true,
    sparse: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    seats: {
      type: [
        {
          section: String,
          row: String,
          seatNumber: Number,
          price: Number,
        },
      ],
      required: true,
    },

    ticketCodes: [ticketCodeSchema], // ⭐ New field ⭐

    totalAmount: { type: Number, required: true },
    paymentStatus: {
      type: String,
      enum: ["success", "failed", "refunded"],
      default: "success",
    },
    status: {
      type: String,
      enum: ["success", "cancelled", "reserved", "refunded"],
      default: "success",
    },

    paymentIntentId: { type: String, required: true },

    orderTime: {
      type: Date,
      default: Date.now,
    },

    isUserVisible: { type: Boolean, default: true },

    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    isUsed: { type: Boolean, default: false },

    scannedAt: { type: Date },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    recipientEmail: {
      type: String,
      default: null,
    },
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel =
  mongoose.models.Order || mongoose.model("Order", orderSchema);

export default OrderModel;

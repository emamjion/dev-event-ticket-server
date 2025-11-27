import moment from "moment-timezone";
import BookingModel from "../models/booking.model.js";
import CouponModel from "../models/coupon.model.js";
import SellerModel from "../models/sellerModel.js";

// helper function
const getSellerId = async (user) => {
  if (user.role === "seller") {
    const seller = await SellerModel.findOne({ userId: user.id });
    if (!seller) throw new Error("Seller not found");
    return seller._id;
  } else if (user.role === "admin") {
    return null; // admin is not a seller
  } else {
    throw new Error("Unauthorized");
  }
};

// create coupon - seller and admin
const createCoupon = async (req, res) => {
  try {
    let sellerId;

    if (req.user.role === "seller") {
      sellerId = await getSellerId(req.user);
    } else {
      // admin must send sellerId manually in body
      sellerId = req.body.sellerId;
    }

    if (!sellerId) {
      return res.status(400).json({
        success: false,
        message: "sellerId is required (admin must select seller)",
      });
    }

    const {
      eventId,
      code,
      discountPercentage,
      minPurchaseAmount,
      startDate,
      endDate,
    } = req.body;

    // Check duplicate coupon
    const existing = await CouponModel.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon code already exists" });
    }

    const sydneyStart = moment.tz(startDate, "Australia/Sydney").toDate();
    const sydneyEnd = moment.tz(endDate, "Australia/Sydney").toDate();

    const newCoupon = new CouponModel({
      sellerId,
      eventId,
      code: code.toUpperCase(),
      discountPercentage,
      minPurchaseAmount,
      startDate: sydneyStart,
      endDate: sydneyEnd,
      status: "approved",
      isActive: true,
      isDeleted: false,
    });

    await newCoupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon: newCoupon,
    });
  } catch (error) {
    console.error("Create coupon error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// update coupon - seller and admin
const updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    let query = { _id: couponId };
    if (req.user.role === "seller") {
      const sellerId = await getSellerId(req.user);
      query.sellerId = sellerId;
    }

    const coupon = await CouponModel.findOne(query);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    if (req.body.startDate) {
      req.body.startDate = moment
        .tz(req.body.startDate, "Australia/Sydney")
        .toDate();
    }

    if (req.body.endDate) {
      req.body.endDate = moment
        .tz(req.body.endDate, "Australia/Sydney")
        .toDate();
    }

    if (req.body.code) {
      req.body.code = req.body.code.toUpperCase();
    }

    Object.assign(coupon, req.body);
    await coupon.save();

    res.status(200).json({ success: true, message: "Coupon updated", coupon });
  } catch (error) {
    console.error("Update coupon error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// softly delete coupon - seller & admin
const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    let query = { _id: couponId };
    if (req.user.role === "seller") {
      const sellerId = await getSellerId(req.user);
      query.sellerId = sellerId;
    }

    const coupon = await CouponModel.findOneAndUpdate(
      query,
      { isDeleted: true },
      { new: true }
    );

    if (!coupon)
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });

    res
      .status(200)
      .json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// permanently delete coupon - seller & admin
const permanentlyDeleteCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    let query = { _id: couponId };
    if (req.user.role === "seller") {
      const sellerId = await getSellerId(req.user);
      query.sellerId = sellerId;
    }

    const coupon = await CouponModel.findOneAndDelete(query);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon permanently deleted",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// restore coupon - seller & admin
const restoreCoupon = async (req, res) => {
  try {
    const couponId = req.params.id;

    const coupon = await CouponModel.findById(couponId);

    if (!coupon || !coupon.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found or already active",
      });
    }

    if (req.user.role === "seller") {
      const sellerId = await getSellerId(req.user);
      if (coupon.sellerId.toString() !== sellerId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Unauthorized seller for this coupon",
        });
      }
    }

    coupon.isDeleted = false;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon restored successfully",
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to restore coupon",
      error: error.message,
    });
  }
};

// toggle coupon status (active/inactive)
const toggleCouponStatus = async (req, res) => {
  try {
    const couponId = req.params.id;

    const coupon = await CouponModel.findById(couponId);

    if (!coupon || coupon.isDeleted) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    if (req.user.role === "seller") {
      const sellerId = await getSellerId(req.user);
      if (coupon.sellerId.toString() !== sellerId.toString()) {
        return res
          .status(403)
          .json({ success: false, message: "Unauthorized access" });
      }
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon is now ${coupon.isActive ? "active" : "inactive"}`,
      coupon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle coupon status",
      error: error.message,
    });
  }
};

// get coupons - seller & admin
const getSellerCoupons = async (req, res) => {
  try {
    let query = { isDeleted: false };

    if (req.user.role === "seller") {
      const sellerId = await getSellerId(req.user);
      query.sellerId = sellerId;
    }

    const coupons = await CouponModel.find(query).populate("eventId", "name");

    res.status(200).json({
      success: true,
      total: coupons.length,
      message: "Coupons fetched successfully",
      coupons,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// admin only: get all coupons
const getAllCoupons = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only admin can view all coupons",
      });
    }

    const coupons = await CouponModel.find({ isDeleted: false })
      .populate("eventId", "title date")
      .populate("sellerId", "name email contactNumber organizationName");

    res.status(200).json({
      success: true,
      total: coupons.length,
      message: "All coupons fetched successfully",
      coupons,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// apply coupon
const applyCoupon = async (req, res) => {
  try {
    const { code, eventId, totalAmount, bookingId } = req.body;

    const sydneyNow = moment().tz("Australia/Sydney").toDate();

    const coupon = await CouponModel.findOne({
      code: code.toUpperCase(),
      eventId,
      status: "approved",
      startDate: { $lte: sydneyNow },
      endDate: { $gte: sydneyNow },
    });

    if (!coupon) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired coupon (Sydney timezone check).",
      });
    }

    if (!coupon.isActive) {
      return res.status(400).json({
        success: false,
        message: "This coupon is currently inactive.",
      });
    }

    const discountAmount = (coupon.discountPercentage / 100) * totalAmount;
    const finalPrice = Math.max(0, totalAmount - discountAmount);

    if (bookingId) {
      const booking = await BookingModel.findById(bookingId);
      if (booking) {
        booking.couponCode = code.toUpperCase();
        booking.couponId = coupon._id;
        booking.discountAmount = discountAmount;
        booking.finalAmount = finalPrice;
        booking.originalAmount = totalAmount;
        await booking.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      discountAmount,
      finalPrice,
      couponId: coupon._id,
      sydneyNow,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getSellerCoupons,
  permanentlyDeleteCoupon,
  restoreCoupon,
  toggleCouponStatus,
  updateCoupon,
};

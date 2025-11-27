import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import moment from "moment-timezone";
import EventModel from "../models/eventModel.js";
import SellerModel from "../models/sellerModel.js";

// Helper to get sellerId based on role
const getSellerId = async (user) => {
  if (user.role === "seller") {
    const seller = await SellerModel.findOne({ userId: user.id });
    if (!seller) throw new Error("Seller not found");
    return seller._id;
  } else if (user.role === "admin") {
    return user.id;
  } else {
    throw new Error("Unauthorized");
  }
};

// ==============================
//       CREATE EVENT
// ==============================
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      venue,
      startDate,
      endDate,
      banner,
      price,
      sellerId,
    } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date & End date are required",
      });
    }

    // Sydney timezone conversion (same as coupon logic)
    const sydneyStart = moment.tz(startDate, "Australia/Sydney").toDate();
    const sydneyEnd = moment.tz(endDate, "Australia/Sydney").toDate();

    const newEvent = new EventModel({
      title,
      description,
      venue,
      banner,
      price,
      sellerId,
      startDate: sydneyStart,
      endDate: sydneyEnd,
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    console.error("Create Event Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
//        GET EVENTS
// ==============================
const getSellerEvents = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "seller") {
      const sellerId = await getSellerId(req.user);
      query.sellerId = sellerId;
    }

    if (req.user.role === "admin" && req.query.sellerId) {
      query.sellerId = req.query.sellerId;
    }

    const events = await EventModel.find(query).select(
      "title startDate endDate venue"
    );

    res.status(200).json({
      success: true,
      total: events.length,
      events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
//        UPDATE EVENT
// ==============================
const updateEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;

    if (!req.body && !req.file) {
      return res.status(400).json({
        success: false,
        message: "No data provided to update",
      });
    }

    let event;

    if (user.role === "admin") {
      event = await EventModel.findById(eventId);
    } else if (user.role === "seller") {
      const sellerId = await getSellerId(user);
      event = await EventModel.findOne({ _id: eventId, sellerId });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or unauthorized",
      });
    }

    // If banner image updated
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      req.body.banner = result.secure_url;

      fs.unlinkSync(req.file.path);
    }

    // Sydney timezone update (same logic as coupon)
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

    // Merge updates
    Object.assign(event, req.body);
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error("Update Event Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
//        DELETE EVENT
// ==============================
const deleteEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;

    let event;

    if (user.role === "admin") {
      event = await EventModel.findById(eventId);
    } else if (user.role === "seller") {
      const sellerId = await getSellerId(user);
      event = await EventModel.findOne({ _id: eventId, sellerId });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or unauthorized",
      });
    }

    await event.deleteOne();

    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createEvent, deleteEvent, getSellerEvents, updateEvent };

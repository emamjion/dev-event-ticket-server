import { v2 as cloudinary } from "cloudinary";
import moment from "moment-timezone";
import EventModel from "../models/eventModel.js";
import SellerModel from "../models/sellerModel.js";

// Sydney timezone converter
const convertToSydneyTime = (date, time) => {
  const combined = `${date} ${time}`;
  return moment.tz(combined, "YYYY-MM-DD HH:mm", "Australia/Sydney").toDate();
};

// Get Seller ID
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

const createEvent = async (req, res) => {
  try {
    const sellerId = await getSellerId(req.user);

    const {
      title,
      description,
      date,
      time,
      location,
      contactNumber,
      email,
      price,
      seatTemplate,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const sydneyDateTime = convertToSydneyTime(date, time);

    // Upload image
    const base64Image = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "event-images",
    });

    // Check duplicate event
    const existingEvent = await EventModel.findOne({
      title,
      date,
      sellerId,
    });

    if (existingEvent) {
      return res.status(400).json({
        success: false,
        message: "You have already created this event.",
      });
    }

    const newEvent = new EventModel({
      title,
      description,
      date,
      time,
      sydneyDateTime,
      seatTemplate,
      location,
      image: result.secure_url,
      contactNumber,
      email,
      price: Number(price),
      isPublished: false,
      ticketSold: 0,
      sellerId,
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================= Get Events =========================
const getSellerEvents = async (req, res) => {
  try {
    const sellerId = await getSellerId(req.user);

    const events = await EventModel.find({ sellerId });
    res.status(200).json({ success: true, totalEvents: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================= Update Event =========================
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
    } else {
      const sellerId = await getSellerId(user);
      event = await EventModel.findOne({ _id: eventId, sellerId });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or unauthorized",
      });
    }

    // If date/time updated → recalc Sydney time
    if (req.body.date || req.body.time) {
      const newDate = req.body.date || event.date;
      const newTime = req.body.time || event.time;

      req.body.sydneyDateTime = convertToSydneyTime(newDate, newTime);
    }

    // Update image
    if (req.file) {
      const base64Image = `data:${
        req.file.mimetype
      };base64,${req.file.buffer.toString("base64")}`;

      const uploaded = await cloudinary.uploader.upload(base64Image, {
        folder: "event-images",
      });

      req.body.image = uploaded.secure_url;
    }

    Object.assign(event, req.body);
    await event.save();

    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================= Delete Event =========================
const deleteEvent = async (req, res) => {
  try {
    const user = req.user;
    const eventId = req.params.id;

    let event;

    if (user.role === "admin") {
      event = await EventModel.findById(eventId);
    } else {
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

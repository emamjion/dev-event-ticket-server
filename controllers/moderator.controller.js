import EventModel from "../models/eventModel.js";
import UserModel from "../models/userModel.js";

// only admin can added moderator to event
const addModeratorToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { moderatorId } = req.body;

    const event = await EventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const moderator = await UserModel.findOne({
      _id: moderatorId,
      role: "moderator",
    });

    if (!moderator) {
      return res
        .status(404)
        .json({ success: false, message: "Moderator not found" });
    }

    if (event.moderators.includes(moderatorId)) {
      return res
        .status(400)
        .json({ success: false, message: "Moderator already added" });
    }

    event.moderators.push(moderatorId);
    await event.save();

    res.status(200).json({
      success: true,
      message: "Moderator added to event successfully",
      event,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
};

const removeModeratorFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { moderatorId } = req.body;

    const event = await EventModel.findById(eventId);
    const moderator = await UserModel.findById(moderatorId);

    if (!event || !moderator) {
      return res
        .status(404)
        .json({ success: false, message: "Event or Moderator not found" });
    }

    event.moderators = event.moderators.filter(
      (id) => id.toString() !== moderatorId
    );
    moderator.assignedEvents = moderator.assignedEvents.filter(
      (id) => id.toString() !== eventId
    );

    await event.save();
    await moderator.save();

    res.status(200).json({
      success: true,
      message: "Moderator removed from event",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

const getEventModerators = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await EventModel.findById(eventId).populate(
      "moderators",
      "name email profileImage"
    );

    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }

    res.status(200).json({
      success: true,
      message: "All Moderators fetched successfully",
      totalModerators: event.moderators.length,
      data: {
        eventId: event._id,
        eventName: event.name,
        moderators: event.moderators,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const updateModeratorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, contactNumber, address, profileImg } = req.body;

    const moderator = await UserModel.findById(userId);

    if (!moderator) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (moderator.role !== "moderator") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied: Not a moderator" });
    }

    if (name) moderator.name = name;
    if (contactNumber) moderator.contactNumber = contactNumber;
    if (address) moderator.address = address;
    if (profileImg) moderator.profileImg = profileImg;

    await moderator.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: moderator,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ sucess: false, message: "Server error", error });
  }
};

export {
  addModeratorToEvent,
  getEventModerators,
  removeModeratorFromEvent,
  updateModeratorProfile,
};

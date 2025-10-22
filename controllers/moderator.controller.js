import UserModel from "../models/userModel.js";

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

export { updateModeratorProfile };

import jwt from "jsonwebtoken";
import UserModel from "../models/userModel.js";

const verifyModerator = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_SCANNER);

    if (decoded.role !== "moderator") {
      return res.status(403).json({
        message: "Access denied. Moderator token required.",
      });
    }

    const user = await UserModel.findById(decoded.id);
    if (!user || user.role !== "moderator") {
      return res.status(403).json({
        message: "Invalid moderator account",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

export default verifyModerator;

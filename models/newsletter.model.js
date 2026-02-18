import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    isSubscribed: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String, // homepage, footer, checkout etc
      default: "website",
    },
  },
  { timestamps: true },
);

const NewsletterModel =
  mongoose.models.Newsletter || mongoose.model("Newsletter", newsletterSchema);

export default NewsletterModel;

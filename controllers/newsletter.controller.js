import transporter from "../config/nodeMailer.js";
import NewsletterModel from "../models/newsletter.model.js";
import {
  reactivationTemplate,
  subscriptionTemplate,
  unsubscribeTemplate,
} from "../utils/newsletterEmailTemplate.js";

const subscribeNewsletter = async (req, res) => {
  try {
    const { email, source } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingSubscriber = await NewsletterModel.findOne({ email });

    // If already exists & active
    if (existingSubscriber && existingSubscriber.isSubscribed) {
      return res.status(400).json({
        success: false,
        message: "You are already subscribed",
      });
    }

    // If exists but unsubscribed → reactivate
    if (existingSubscriber && !existingSubscriber.isSubscribed) {
      existingSubscriber.isSubscribed = true;
      existingSubscriber.unsubscribedAt = null;
      await existingSubscriber.save();

      // Send reactivation email
      const mail = reactivationTemplate(email);

      await transporter.sendMail({
        from: `"Events N Tickets Platform" <${process.env.SENDER_EMAIL}>`,
        to: email,
        subject: mail.subject,
        html: mail.html,
      });

      return res.status(200).json({
        success: true,
        message: "Subscription reactivated successfully",
      });
    }

    // New subscription
    await NewsletterModel.create({
      email,
      source,
    });

    // 🔥 Send confirmation email
    const mail = subscriptionTemplate(email);

    await transporter.sendMail({
      from: `"Events N Tickets Platform" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: mail.subject,
      html: mail.html,
    });

    res.status(201).json({
      success: true,
      message: "Subscribed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// function to Unsubscribe
const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    const subscriber = await NewsletterModel.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    subscriber.isSubscribed = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    // Send unsubscribe email
    const mail = unsubscribeTemplate(email);

    await transporter.sendMail({
      from: `"Events N Tickets Platform" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: mail.subject,
      html: mail.html,
    });

    res.status(200).json({
      success: true,
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Admin - Get All Subscribers
const getAllSubscribers = async (req, res) => {
  try {
    const subscribers = await NewsletterModel.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      message: "All subscribers fetched successfully",
      subscribers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { getAllSubscribers, subscribeNewsletter, unsubscribeNewsletter };

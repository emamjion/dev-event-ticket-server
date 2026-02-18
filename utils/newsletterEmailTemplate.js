// export const subscriptionTemplate = (email) => {
//   return {
//     subject: "🎉 Successfully Subscribed to Our Newsletter!",
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2>Thank you for subscribing! 🎟️</h2>
//         <p>Hello,</p>
//         <p>You have successfully subscribed with <strong>${email}</strong>.</p>
//         <p>You will now receive updates about upcoming events, exclusive ticket offers, and special announcements.</p>
//         <br/>
//         <p>If this wasn't you, you can unsubscribe anytime.</p>
//         <hr/>
//         <p style="font-size:12px;color:gray;">
//           © ${new Date().getFullYear()} Your Event Ticket Platform
//         </p>
//       </div>
//     `,
//   };
// };

export const subscriptionTemplate = (email) => {
  return {
    subject: "🎉 You're In! Welcome to Our Events N Tickets Community",
    html: `
    <div style="background:#f4f6f9;padding:40px 0;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.08);">
        
        <div style="background:#ff6900;padding:30px;text-align:center;color:#fff;">
          <h1 style="margin:0;font-size:26px;">🎟️ Welcome Aboard!</h1>
          <p style="margin-top:8px;font-size:14px;">You're now part of our exclusive event community</p>
        </div>

        <div style="padding:30px;color:#333;">
          <p style="font-size:15px;">Hello,</p>
          <p style="font-size:15px;line-height:1.6;">
            You’ve successfully subscribed with 
            <strong>${email}</strong>.
          </p>

          <p style="font-size:15px;line-height:1.6;">
            Get ready to receive updates about upcoming concerts, tech expos, festivals, and exclusive ticket discounts before anyone else!
          </p>

          <div style="text-align:center;margin:30px 0;">
            <a href="https://eventsntickets.com.au/event-list"
              style="background:#ff6900;color:#fff;padding:12px 25px;
              text-decoration:none;border-radius:6px;
              font-weight:bold;font-size:14px;display:inline-block;">
              Explore Upcoming Events
            </a>
          </div>

          <p style="font-size:13px;color:#777;">
            If this wasn’t you, you can unsubscribe anytime.
          </p>
        </div>

        <div style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#999;">
          © ${new Date().getFullYear()} Your Events N Tickets Platform • All rights reserved
        </div>

      </div>
    </div>
    `,
  };
};

// export const reactivationTemplate = (email) => {
//   return {
//     subject: "🔔 Welcome Back! Subscription Reactivated",
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2>Your subscription is active again!</h2>
//         <p>${email} is now re-subscribed to our newsletter.</p>
//         <p>Stay tuned for exciting event updates!</p>
//       </div>
//     `,
//   };
// };

export const reactivationTemplate = (email) => {
  return {
    subject: "🔔 Welcome Back! You're Subscribed Again",
    html: `
    <div style="background:#f4f6f9;padding:40px 0;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.08);">
        
        <div style="background:linear-gradient(135deg,#10b981,#34d399);padding:30px;text-align:center;color:#fff;">
          <h1 style="margin:0;font-size:24px;">🎉 Welcome Back!</h1>
        </div>

        <div style="padding:30px;color:#333;">
          <p>Hello,</p>
          <p style="line-height:1.6;">
            Great news! <strong>${email}</strong> is now re-subscribed to our newsletter.
          </p>
          <p style="line-height:1.6;">
            You won’t miss out on exclusive events, early bird tickets, and limited-time discounts anymore.
          </p>

          <div style="text-align:center;margin:30px 0;">
            <a href="https://eventsntickets.com.au"
              style="background:#10b981;color:#fff;padding:12px 25px;
              text-decoration:none;border-radius:6px;
              font-weight:bold;font-size:14px;display:inline-block;">
              Visit Website
            </a>
          </div>
        </div>

        <div style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#999;">
          Stay tuned for exciting updates 🚀
        </div>

      </div>
    </div>
    `,
  };
};

// export const unsubscribeTemplate = (email) => {
//   return {
//     subject: "You have been unsubscribed",
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">
//         <h2>Unsubscribed Successfully</h2>
//         <p>${email} has been removed from our newsletter list.</p>
//         <p>We're sorry to see you go 😔</p>
//       </div>
//     `,
//   };
// };

export const unsubscribeTemplate = (email) => {
  return {
    subject: "You've Successfully Unsubscribed",
    html: `
    <div style="background:#f4f6f9;padding:40px 0;font-family:Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 8px 20px rgba(0,0,0,0.08);">
        
        <div style="background:linear-gradient(135deg,#ef4444,#f87171);padding:30px;text-align:center;color:#fff;">
          <h1 style="margin:0;font-size:24px;">We're Sorry to See You Go 😔</h1>
        </div>

        <div style="padding:30px;color:#333;">
          <p>Hello,</p>
          <p style="line-height:1.6;">
            <strong>${email}</strong> has been removed from our newsletter list.
          </p>
          <p style="line-height:1.6;">
            If this was a mistake, you can re-subscribe anytime from our website.
          </p>

          <div style="text-align:center;margin:30px 0;">
            <a href="https://eventsntickets.com.au"
              style="background:#ef4444;color:#fff;padding:12px 25px;
              text-decoration:none;border-radius:6px;
              font-weight:bold;font-size:14px;display:inline-block;">
              Subscribe Again
            </a>
          </div>
        </div>

        <div style="background:#f9fafb;padding:15px;text-align:center;font-size:12px;color:#999;">
          Thank you for being with us ❤️
        </div>

      </div>
    </div>
    `,
  };
};

export const refundCancelTemplate = ({
  customerEmail,
  customerName,
  eventName,
  seat,
  refundAmount,
  isFree,
}) => {
  return {
    subject: isFree
      ? "🎟️ Ticket Cancelled Successfully"
      : "💸 Refund Processed Successfully",

    html: `
    <div style="
      font-family: Arial, sans-serif;
      max-width:600px;
      margin:auto;
      background:#ffffff;
      border-radius:10px;
      border:1px solid #eee;
      overflow:hidden;
    ">

      <!-- Header -->
      <div style="
       background:#ff6900;
        color:white;
        padding:20px;
        text-align:center;
      ">
        <h2 style="margin:0;">
          ${isFree ? "Ticket Cancelled" : "Refund Successful"}
        </h2>
      </div>

      <!-- Body -->
      <div style="padding:25px;color:#333;">

        <p>Hello, ${customerName}</p>

        <p>
          Your ticket for <strong>${eventName}</strong> has been successfully cancelled.
        </p>

        <div style="
          background:#f8f9fa;
          padding:15px;
          border-radius:8px;
          margin:15px 0;
        ">
          <p>
            <strong>Seat:</strong>
            ${seat?.section || "-"} - Row ${seat?.row || "-"} - Seat ${seat?.seatNumber || "-"}
            </p>

          ${
            isFree
              ? `<p><strong>Refund:</strong> Not applicable (Free ticket)</p>`
              : `<p><strong>Refund Amount:</strong> ৳${refundAmount}</p>`
          }
        </div>

        ${
          isFree
            ? `<p>No payment was made for this ticket.</p>`
            : `<p>Your refund will be credited within 5-10 business days.</p>`
        }

        <p>
          Thank you for using our platform.
        </p>

      </div>

      <!-- Footer -->
      <div style="
        background:#f1f1f1;
        padding:15px;
        text-align:center;
        font-size:12px;
        color:#666;
      ">
        © ${new Date().getFullYear()} Events N Tickets Platform
      </div>

    </div>
    `,
  };
};

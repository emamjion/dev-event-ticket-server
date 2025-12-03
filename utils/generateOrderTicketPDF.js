import bwipjs from "bwip-js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const generateOrderTicketPDF = async (order, event) => {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ margin: 0 });
    const buffers = [];
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const pageWidth = doc.page.width;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    const ticketHeight = 600;

    // ✅ Loop through ALL tickets (QR + Seat mapping)
    for (let i = 0; i < order.ticketCodes.length; i++) {
      const ticket = order.ticketCodes[i];
      const seat = order.seats[i]; // 👉 REAL seat mapping HERE

      const section = seat?.section || "N/A";
      const row = seat?.row || "N/A";
      const seatNumber = seat?.seatNumber || "N/A";
      const ticketCode = ticket?.code || "UNKNOWN";

      // Generate QR
      let qrBuffer = null;
      try {
        qrBuffer = await bwipjs.toBuffer({
          bcid: "qrcode",
          text: String(ticketCode),
          scale: 5,
          includetext: false,
        });
      } catch (e) {
        console.log("QR ERROR:", e);
      }

      if (i > 0) doc.addPage();

      // Background
      doc.rect(0, 0, pageWidth, doc.page.height).fill("#f7fafc");

      // Ticket container
      doc.fillColor("#ffffff");
      doc.roundedRect(margin, margin, contentWidth, ticketHeight, 8).fill();
      doc.lineWidth(1.5).strokeColor("#e5e7eb");
      doc.roundedRect(margin, margin, contentWidth, ticketHeight, 8).stroke();

      // Header area
      const headerHeight = 80;
      doc.fillColor("#6c757d");
      doc.roundedRect(margin, margin, contentWidth, headerHeight, 8).fill();

      // Logo
      const logoPath = path.resolve("public/events-logo.png");
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, margin + 30, margin + 10, {
          width: 60,
          height: 60,
        });
      }

      // Ticket number badge
      const badgeX = margin + contentWidth - 180;
      doc
        .fillColor("#495057")
        .roundedRect(badgeX, margin + 25, 120, 30, 5)
        .fill();

      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(
          `TICKET ${i + 1} OF ${order.ticketCodes.length}`,
          badgeX + 15,
          margin + 33
        );

      // MAIN CONTENT
      const contentY = margin + headerHeight + 30;
      const leftColX = margin + 25;
      const rightColX = margin + contentWidth * 0.55;

      let currentY = contentY;

      // EVENT info
      doc.fillColor("#e05829").fontSize(14).font("Helvetica-Bold");
      doc.text("EVENT INFORMATION", leftColX, currentY);
      currentY += 30;

      doc.fillColor("#2d3748").fontSize(13).font("Helvetica-Bold");
      doc.text(`Title: ${event?.title || "Event"}`, leftColX, currentY);
      currentY += 20;

      doc.fontSize(11).font("Helvetica");
      doc.text(`Date: ${event?.date || "TBA"}`, leftColX, currentY);
      currentY += 16;
      doc.text(`Time: ${event?.time || "TBA"}`, leftColX, currentY);
      currentY += 16;
      doc.text(`Location: ${event?.location || "TBA"}`, leftColX, currentY);
      currentY += 40;

      // HOLDER info
      doc.fillColor("#e05829").fontSize(14).font("Helvetica-Bold");
      doc.text("TICKET HOLDER", leftColX, currentY);
      currentY += 30;

      doc.fillColor("#2d3748").fontSize(11);
      doc.text(
        `Name: ${order?.buyerId?.name || "Guest User"}`,
        leftColX,
        currentY
      );
      currentY += 16;

      doc.text(
        `Email: ${order?.buyerId?.email || "No Email"}`,
        leftColX,
        currentY
      );
      currentY += 40;

      // SEAT info
      doc.fillColor("#e05829").fontSize(14).font("Helvetica-Bold");
      doc.text("SEAT ASSIGNMENT", leftColX, currentY);
      currentY += 30;

      doc.fillColor("#2d3748").fontSize(11);
      doc.text(
        `Seat: Section ${section} Row ${row} Seat ${seatNumber}`,
        leftColX,
        currentY
      );
      currentY += 40;

      // ORDER DETAILS
      doc.fillColor("#e05829").fontSize(14).font("Helvetica-Bold");
      doc.text("ORDER DETAILS", leftColX, currentY);
      currentY += 30;

      doc.fillColor("#2d3748");
      doc.text(
        `Order ID: ${String(order?._id).substring(0, 16)}`,
        leftColX,
        currentY
      );
      currentY += 16;

      doc.text(
        `Purchased: ${new Date(order?.createdAt).toLocaleDateString()}`,
        leftColX,
        currentY
      );

      // QR AREA
      let qrY = contentY;

      doc.fillColor("#e05829").fontSize(14).font("Helvetica-Bold");
      doc.text("VALIDATION", rightColX, qrY);
      qrY += 40;

      doc.fillColor("#6c757d").fontSize(10).font("Helvetica-Bold");
      doc.text("SCAN QR CODE", rightColX, qrY);
      qrY += 20;

      const qrBoxSize = 150;
      doc
        .fillColor("#fafafa")
        .rect(rightColX, qrY, qrBoxSize, qrBoxSize)
        .fill();
      doc
        .strokeColor("#e5e7eb")
        .rect(rightColX, qrY, qrBoxSize, qrBoxSize)
        .stroke();

      if (qrBuffer) {
        doc.image(qrBuffer, rightColX + 10, qrY + 10, {
          width: qrBoxSize - 20,
          height: qrBoxSize - 20,
        });
      }

      qrY += qrBoxSize + 10;

      doc.fillColor("#2d3748").fontSize(10);
      doc.text(ticketCode, rightColX + 10, qrY);
    }

    doc.end();
  });
};

export default generateOrderTicketPDF;

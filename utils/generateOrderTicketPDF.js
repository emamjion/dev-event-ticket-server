import bwipjs from "bwip-js";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

const generateOrderTicketPDF = async (order, event) => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 0,
      });

      let buffers = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;

      const containerWidth = pageWidth - 100;
      const containerX = 50;
      const containerY = 60;
      const containerHeight = 680;

      const totalTickets = order.ticketCodes.length;

      for (let i = 0; i < totalTickets; i++) {
        const ticket = order.ticketCodes[i];
        const seat = order.seats[i];

        if (i > 0) doc.addPage();

        // Background
        doc.rect(0, 0, pageWidth, pageHeight).fill("#f2f2f2");

        // Outer white card
        doc
          .roundedRect(
            containerX,
            containerY,
            containerWidth,
            containerHeight,
            10
          )
          .fill("#ffffff");

        // HEADER ORANGE (rounded top)
        const headerHeight = 80;
        doc
          .fillColor("#f36f21")
          .roundedRect(containerX, containerY, containerWidth, headerHeight, 10)
          .fill();

        // LOGO
        const logoPath = path.resolve("public/events-logo.png");
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, containerX + 20, containerY + 12, {
            width: 55,
            height: 55,
          });
        }

        // Title center
        doc
          .fillColor("#ffffff")
          .font("Helvetica-Bold")
          .fontSize(20)
          .text(event.title, containerX, containerY + 25, {
            width: containerWidth,
            align: "center",
          });

        // Right badge
        doc
          .fillColor("#d95f13")
          .roundedRect(
            containerX + containerWidth - 120,
            containerY + 20,
            90,
            35,
            6
          )
          .fill();

        doc
          .fillColor("#ffffff")
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(
            `${i + 1} TICKET`,
            containerX + containerWidth - 120 + 17,
            containerY + 28
          );

        // Orange thin bar under header
        doc
          .rect(containerX, containerY + headerHeight - 2, containerWidth, 3)
          .fill("#f36f21");

        // CONTENT AREA -------------------------------------------------

        const leftX = containerX + 30;
        const rightX = containerX + containerWidth * 0.56;
        let curY = containerY + headerHeight + 25;

        // --- LEFT COLUMN ---
        doc.fillColor("#e05829").font("Helvetica-Bold").fontSize(14);
        doc.text("EVENT INFORMATION", leftX, curY);
        curY += 30;

        doc.fillColor("#222").fontSize(11).font("Helvetica");
        doc.text(`Date: ${event.date}`, leftX, curY);
        curY += 16;
        doc.text(`Time: ${event.time}`, leftX, curY);
        curY += 16;
        doc.text(`Location: ${event.location}`, leftX, curY);
        curY += 35;

        doc.fillColor("#e05829").font("Helvetica-Bold").fontSize(14);
        doc.text("TICKET HOLDER", leftX, curY);
        curY += 30;

        doc.fillColor("#222").fontSize(11).font("Helvetica");
        doc.text(`Name: ${order.buyerId.name}`, leftX, curY);
        curY += 16;
        doc.text(`Email: ${order.buyerId.email}`, leftX, curY);
        curY += 35;

        doc.fillColor("#e05829").font("Helvetica-Bold").fontSize(14);
        doc.text("SEAT ASSIGNMENT", leftX, curY);
        curY += 30;

        doc.fillColor("#222").fontSize(11).font("Helvetica");
        doc.text(`Seat: ${seat.section} ${seat.seatNumber}`, leftX, curY);
        curY += 16;
        doc.text(`Section: ${seat.section}`, leftX, curY);
        curY += 16;
        doc.text(`Row: ${seat.row}`, leftX, curY);
        curY += 16;
        doc.text(`Seat Number: ${seat.seatNumber}`, leftX, curY);
        curY += 35;

        doc.fillColor("#e05829").font("Helvetica-Bold").fontSize(14);
        doc.text("ORDER DETAILS", leftX, curY);
        curY += 30;

        doc.fillColor("#222").fontSize(11).font("Helvetica");
        doc.text(`Order ID: ${order._id}`, leftX, curY);
        curY += 16;
        doc.text(`Booking ID: ${order.bookingId}`, leftX, curY);
        curY += 16;
        doc.text(
          `Purchased: ${new Date(order.createdAt).toLocaleDateString()}`,
          leftX,
          curY
        );

        // Vertical Divider
        doc
          .strokeColor("#eaeaea")
          .lineWidth(1)
          .moveTo(rightX - 20, containerY + headerHeight + 15)
          .lineTo(rightX - 20, containerY + containerHeight - 90)
          .stroke();

        // RIGHT COLUMN -------------------------------------------------

        let rightY = containerY + headerHeight + 25;

        // PAYMENT
        doc.fillColor("#e05829").font("Helvetica-Bold").fontSize(14);
        doc.text("PAYMENT", rightX, rightY);
        rightY += 25;

        doc.fillColor("#f36f21").fontSize(26).font("Helvetica-Bold");
        doc.text(order.total.toFixed(2), rightX, rightY);
        rightY += 50;

        // VALIDATION
        doc.fillColor("#e05829").font("Helvetica-Bold").fontSize(14);
        doc.text("VALIDATION", rightX, rightY);
        rightY += 20;

        doc.fillColor("#555").fontSize(10).font("Helvetica-Bold");
        doc.text("QR CODE", rightX, rightY);
        rightY += 15;

        const qrBoxSize = 160;

        // QR BOX BACKGROUND
        doc
          .fillColor("#ffffff")
          .rect(rightX, rightY, qrBoxSize, qrBoxSize)
          .fill()
          .strokeColor("#ddd")
          .lineWidth(1)
          .stroke();

        // QR GENERATE
        let qrBuffer = await bwipjs.toBuffer({
          bcid: "qrcode",
          text: ticket.code,
          scale: 5,
          includetext: false,
        });

        doc.image(qrBuffer, rightX + 10, rightY + 10, {
          width: qrBoxSize - 20,
          height: qrBoxSize - 20,
        });

        rightY += qrBoxSize + 5;

        doc.fontSize(10).fillColor("#222");
        doc.text(ticket.code, rightX + 10, rightY);

        // FOOTER --------------------------------------------------

        const footerY = containerY + containerHeight - 60;

        // orange line
        doc.rect(containerX, footerY, containerWidth, 3).fill("#f36f21");

        doc.fillColor("#777").fontSize(10).font("Helvetica");
        doc.text(
          "This ticket is valid for entry to the specified event.\nPresent this ticket along with valid ID at the venue entrance.",
          containerX,
          footerY + 10,
          { width: containerWidth, align: "center" }
        );
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

export default generateOrderTicketPDF;

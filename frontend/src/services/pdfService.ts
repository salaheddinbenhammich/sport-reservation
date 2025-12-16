import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Session {
  startTime: string;
  endTime: string;
  price: number;
  duration?: string;
}

interface ReservationPDFData {
  stadiumName: string;
  stadiumImage?: string | string[];
  organizer: string;
  organizerEmail?: string;
  organizerPhone?: string;
  players?: string[];
  sessions: Session[];
  totalPrice: number;
  paymentMode?: "all" | "split";
  perPerson?: number;
  date: string;
  stadiumLocation?: string;
  surfaceType?: string;
  status?: "confirmed" | "pending" | "cancelled";
  bookingReference?: string;
  amenities?: string[];
  cancellationPolicy?: string;
}

export const generateReservationPDF = (data: ReservationPDFData) => {
  const {
    stadiumName,
    stadiumImage,
    organizer,
    organizerEmail,
    organizerPhone,
    players = [],
    sessions,
    totalPrice,
    paymentMode = "all",
    perPerson,
    date,
    stadiumLocation,
    surfaceType,
    status = "confirmed",
    bookingReference,
    amenities = [],
    cancellationPolicy = "Free cancellation up to 24 hours before reservation",
  } = data;

  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - 2 * margin;

  // COLORS
  const brandPrimary = [16, 185, 129];
  const brandSecondary = [5, 150, 105];
  const textPrimary = [17, 24, 39];
  const textSecondary = [107, 114, 128];
  const bgLight = [249, 250, 251];
  const borderColor = [229, 231, 235];
  const successGreen = [16, 185, 129];
  const warningOrange = [251, 146, 60];
  const errorRed = [239, 68, 68];

  const addLine = (y: number, color = borderColor) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.25);
    doc.line(margin, y, pageWidth - margin, y);
  };

  const addSectionHeader = (title: string, y: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...brandPrimary);
    doc.text(title, margin, y);
    doc.setDrawColor(...brandPrimary);
    doc.setLineWidth(0.4);
    doc.line(margin, y + 1, margin + 25, y + 1);
    return y + 7;
  };

  // ===== HEADER =====
  doc.setFillColor(...brandPrimary);
  doc.rect(0, 0, pageWidth, 28, "F");

  doc.setFillColor(255, 255, 255);
  doc.circle(20, 14, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...brandPrimary);
  doc.text("GT", 16.5, 16.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.setTextColor(255, 255, 255);
  doc.text("GoalTime", 30, 13.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(240, 253, 244);
  doc.text("Premium Stadium Booking", 30, 18);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("BOOKING CONFIRMATION", pageWidth - margin, 13, { align: "right" });

  let statusColor = successGreen;
  let statusText = "CONFIRMED";
  if (status === "pending") {
    statusColor = warningOrange;
    statusText = "PENDING";
  } else if (status === "cancelled") {
    statusColor = errorRed;
    statusText = "CANCELLED";
  }

  doc.setFillColor(...statusColor);
  doc.roundedRect(pageWidth - margin - 35, 17, 35, 6.5, 1, 1, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(statusText, pageWidth - margin - 17.5, 21, { align: "center" });

  let currentY = 36;

  // ===== BOOKING REFERENCE =====
  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, currentY, contentWidth, 13, 2, 2, "F");

  const refNumber =
    bookingReference ||
    `GT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...textSecondary);
  doc.text("Booking Reference", margin + 3, currentY + 4);
  doc.setFontSize(11);
  doc.setTextColor(...textPrimary);
  doc.text(refNumber, margin + 3, currentY + 9);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...textSecondary);
  doc.text("Issue Date", pageWidth - margin - 3, currentY + 4, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...textPrimary);
  doc.text(
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    pageWidth - margin - 3,
    currentY + 9,
    { align: "right" }
  );

  currentY += 20;

  // ===== STADIUM INFO =====
  currentY = addSectionHeader("Stadium Information", currentY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...textPrimary);
  doc.text(stadiumName, margin, currentY + 5);
  currentY += 10;

  const imageWidth = 95;
  const imageHeight = 52;
  const imageX = margin;
  const imageY = currentY;

  const qrBoxWidth = 38;
  const qrBoxHeight = imageHeight;
  const qrBoxX = pageWidth - margin - qrBoxWidth;
  const qrBoxY = imageY;

  if (stadiumImage) {
    try {
      const imgSrc = Array.isArray(stadiumImage) ? stadiumImage[0] : stadiumImage;
      if (imgSrc && imgSrc.trim() !== "") {
        doc.setDrawColor(...borderColor);
        doc.roundedRect(imageX, imageY, imageWidth, imageHeight, 1.5, 1.5, "S");
        doc.addImage(
          imgSrc,
          "JPEG",
          imageX + 0.5,
          imageY + 0.5,
          imageWidth - 1,
          imageHeight - 1
        );
      }
    } catch {
      console.log("Image loading failed");
    }
  }

  // QR Placeholder
  doc.setDrawColor(...borderColor);
  doc.roundedRect(qrBoxX, qrBoxY, qrBoxWidth, qrBoxHeight, 1.5, 1.5, "S");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...brandPrimary);
  doc.text("QR CODE", qrBoxX + qrBoxWidth / 2, qrBoxY + qrBoxHeight / 2 - 2, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...textSecondary);
  doc.text("Scan to view booking", qrBoxX + qrBoxWidth / 2, qrBoxY + qrBoxHeight / 2 + 3, {
    align: "center",
  });

  let infoY = currentY + imageHeight + 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...textSecondary);

  if (stadiumLocation) {
    doc.text(`Location : ${stadiumLocation}`, margin, infoY);
    infoY += 5;
  }
  if (surfaceType) {
    doc.text(`⚽ Surface: ${surfaceType}`, margin, infoY);
    infoY += 5;
  }
  if (amenities.length > 0) {
    doc.text(`✓ ${amenities.slice(0, 3).join(", ")}`, margin, infoY);
  }

  currentY = imageY + imageHeight + 20;
  addLine(currentY);
  currentY += 8;

  // ===== BOOKING DETAILS =====
  currentY = addSectionHeader("Booking Details", currentY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...textSecondary);
  doc.text("Date:", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(...textPrimary);
  doc.text(
    new Date(date).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    margin + 14,
    currentY
  );
  currentY += 5.5;

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...textSecondary);
  doc.text("Organizer:", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...textPrimary);
  doc.text(organizer, margin + 20, currentY);

  if (organizerEmail) {
    doc.setFontSize(8.5);
    doc.setTextColor(...textSecondary);
    doc.text(`Email : ${organizerEmail}`, margin + 70, currentY);
  }
  currentY += 5;

  if (organizerPhone) {
    doc.setFontSize(8.5);
    doc.text(`☎ ${organizerPhone}`, margin + 20, currentY);
    currentY += 5;
  }

  currentY += 4;

  // ===== SESSION DETAILS =====
  currentY = addSectionHeader("Session Details", currentY);

  const sessionsWithDuration = sessions.map((s, i) => {
    const start = new Date(`2000-01-01T${s.startTime}`);
    const end = new Date(`2000-01-01T${s.endTime}`);
    const durationMs = end.getTime() - start.getTime();
    const hours = Math.floor(durationMs / 3600000);
    const minutes = Math.floor((durationMs % 3600000) / 60000);
    const duration = `${hours}h ${minutes}m`;
    return [(i + 1).toString(), s.startTime, s.endTime, duration, `€${s.price.toFixed(2)}`];
  });

  autoTable(doc, {
    startY: currentY,
    head: [["#", "Start", "End", "Duration", "Price"]],
    body: sessionsWithDuration,
    foot: [["", "", "", "Total", `€${totalPrice.toFixed(2)}`]],
    theme: "grid",
    styles: {
      fontSize: 8.5,
      textColor: textPrimary,
      cellPadding: 1.8,
      lineColor: borderColor,
      lineWidth: 0.15,
    },
    headStyles: {
      fillColor: brandSecondary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
    },
    footStyles: {
      fillColor: bgLight,
      textColor: textPrimary,
      fontStyle: "bold",
      fontSize: 9,
    },
    margin: { left: margin, right: margin },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // ===== PAYMENT =====
  currentY = addSectionHeader("Payment", currentY);

  doc.setFillColor(...bgLight);
  doc.roundedRect(margin, currentY, contentWidth, 15, 1.5, 1.5, "F");
  doc.setDrawColor(...brandPrimary);
  doc.roundedRect(margin, currentY, contentWidth, 15, 1.5, 1.5, "S");

  const leftX = margin + 5;
  const rightX = pageWidth - margin - 5;
  let y = currentY + 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.setTextColor(...brandPrimary);
  doc.text("Total Amount", leftX, y);
  doc.text(`€${totalPrice.toFixed(2)}`, rightX, y, { align: "right" });

  y += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...textSecondary);
  doc.text(
    paymentMode === "split"
      ? `Split payment: €${perPerson?.toFixed(2)} per person`
      : "Full payment by organizer",
    leftX,
    y
  );

  // ===== FIXED FOOTER =====
  // ===== FIXED FOOTER =====
  const footerY = pageHeight - 28;
  addLine(footerY - 3);

  doc.setFillColor(...bgLight);
  doc.rect(margin, footerY - 1, 12, 12, "F");
  doc.setDrawColor(...borderColor);
  doc.rect(margin, footerY - 1, 12, 12, "S");
  doc.setFontSize(5);
  doc.setTextColor(...textSecondary);
  doc.text("QR", margin + 6, footerY + 3, { align: "center" });
  doc.text("CODE", margin + 6, footerY + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...textPrimary);
  doc.text("Scan to view online", margin + 15, footerY + 3);
  doc.setFontSize(6);
  doc.setTextColor(...textSecondary);
  doc.text(
    "Support: support@goaltime.com | +33 1 23 45 67 89",
    margin + 15,
    footerY + 7
  );
  doc.text(
    "GoalTime SAS • 123 Avenue des Champs-Élysées, 75008 Paris",
    margin + 15,
    footerY + 10
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(...brandPrimary);
  doc.text("Powered by GoalTime", pageWidth / 2, pageHeight - 8, { align: "center" });

  // Save
  const filename = `GoalTime_${refNumber}_${stadiumName.replace(/\s+/g, "_")}.pdf`;
  doc.save(filename);
};


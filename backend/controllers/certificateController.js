import PDFDocument from "pdfkit";
import * as certificateService from "../services/certificateService.js";
import Certificate from "../models/certificateModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import Attendance from "../models/attendanceModel.js";

/**
 * Retains original getCertificates dashboard queries for frontend rendering.
 */
export const getCertificates = async (req, res) => {
  try {
    // 1. Fetch all events created by this organizer
    const myEvents = await Event.findAll({
      where: { UserId: req.user.id },
      attributes: ["id", "title", "eventDate"],
    });
    const eventIds = myEvents.map((e) => e.id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        analytics: {
          totalCertificates: 0,
          thisMonth: 0,
          mostAwardedEvent: "None",
          certifiedVolunteers: 0,
        },
        pendingCertificates: [],
        generatedCertificates: [],
      });
    }

    // 2. Fetch all certificates generated for these events
    const certificates = await Certificate.findAll({
      where: { EventId: eventIds },
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["id", "title", "eventDate"],
        },
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 3. Fetch all attendances where volunteer was Present
    const attendances = await Attendance.findAll({
      where: { EventId: eventIds, status: "Present" },
      include: [
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Event,
          as: "event",
          attributes: ["id", "title", "eventDate"],
        },
      ],
    });

    // 4. Calculate Analytics
    const totalCertificates = certificates.length;
    
    // Certificates this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = certificates.filter((c) => {
      const d = new Date(c.issueDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).length;

    // Most awarded event
    const eventCounts = {};
    certificates.forEach((c) => {
      const name = c.event?.title || "Unknown Event";
      eventCounts[name] = (eventCounts[name] || 0) + 1;
    });
    let mostAwardedEvent = "None";
    let maxCount = 0;
    for (const [name, count] of Object.entries(eventCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostAwardedEvent = name;
      }
    }

    // Unique certified volunteers count
    const uniqueVols = new Set(certificates.map((c) => c.UserId));
    const certifiedVolunteers = uniqueVols.size;

    // 5. Filter attendances to find volunteers who are Present but don't have a certificate yet
    const pendingCertificates = attendances
      .filter((att) => {
        return !certificates.some((cert) => cert.UserId === att.UserId && cert.EventId === att.EventId);
      })
      .map((att) => ({
        id: att.id,
        userId: att.UserId,
        volunteerName: att.volunteer?.name || "Unknown",
        volunteerEmail: att.volunteer?.email,
        eventId: att.EventId,
        eventName: att.event?.title || "Unknown Event",
        eventDate: att.event?.eventDate,
        attendanceStatus: att.status,
      }));

    // 6. Map generated certificates details
    const generatedCertificates = certificates.map((c) => ({
      id: c.id,
      certificateId: c.certificateNumber,
      volunteerName: c.volunteer?.name || "Unknown",
      volunteerId: c.volunteer?.id,
      volunteerEmail: c.volunteer?.email,
      eventName: c.event?.title || "Unknown Event",
      eventId: c.event?.id,
      eventDate: c.event?.eventDate,
      generatedDate: c.issueDate,
      hours: c.hours,
      status: "Generated",
    }));

    res.status(200).json({
      analytics: {
        totalCertificates,
        thisMonth,
        mostAwardedEvent,
        certifiedVolunteers,
      },
      pendingCertificates,
      generatedCertificates,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retains original issueCertificate endpoint.
 */
export const issueCertificate = async (req, res) => {
  try {
    const { userId, eventId, issueDate, hours } = req.body;

    if (!userId || !eventId || !issueDate || !hours) {
      return res.status(400).json({ message: "userId, eventId, issueDate, and hours are required" });
    }

    const event = await Event.findByPk(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (event.UserId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to issue certificates for this event" });
    }

    const exists = await Certificate.findOne({ where: { UserId: userId, EventId: eventId } });
    if (exists) {
      return res.status(400).json({ message: "Certificate already issued for this volunteer and event" });
    }

    const certificate = await Certificate.create({
      UserId: userId,
      EventId: eventId,
      issueDate,
      hours,
      issuedBy: req.user.id,
    });

    res.status(201).json({ message: "Certificate issued", certificate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retains original revokeCertificate endpoint.
 */
export const revokeCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findByPk(id, {
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["UserId"],
        },
      ],
    });

    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    if (certificate.event?.UserId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to revoke this certificate" });
    }

    await certificate.destroy();
    res.status(200).json({ message: "Certificate revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- NEW LIFECYCLE API METHODS ---

/**
 * Organizer retrieves eligible volunteers.
 */
export const getEligibleVolunteers = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const eligible = await certificateService.getEligibleVolunteers(eventId, req.user.id);
    res.status(200).json(eligible);
  } catch (error) {
    next(error);
  }
};

/**
 * Organizer generates single certificate.
 */
export const generateCertificate = async (req, res, next) => {
  try {
    const { eventId, userId, hours } = req.body;
    const certificate = await certificateService.generateCertificate(eventId, userId, hours, req.user.id);
    res.status(201).json({
      success: true,
      message: "Certificate generated successfully",
      certificate
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Organizer bulk generates certificates.
 */
export const bulkGenerateCertificates = async (req, res, next) => {
  try {
    const { eventId, volunteers } = req.body;
    const result = await certificateService.bulkGenerateCertificates(eventId, volunteers, req.user.id);
    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Student retrieves own certificates.
 */
export const getMyCertificates = async (req, res, next) => {
  try {
    const certificates = await certificateService.getStudentCertificates(req.user.id);
    res.status(200).json(certificates);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves certificate detail view.
 */
export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await certificateService.getCertificateById(req.params.id, req.user.id, req.user.role);
    res.status(200).json(certificate);
  } catch (error) {
    next(error);
  }
};

const buildCertificatePdfBuffer = (certificate) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        layout: "landscape",
        size: "A4",
        margin: 40,
      });

      const buffers = [];
      doc.on("data", (chunk) => buffers.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", (err) => reject(err));

      const width = doc.page.width;
      const height = doc.page.height;

      // Outer Decorative Border (Double Amber/Navy border)
      doc
        .rect(20, 20, width - 40, height - 40)
        .lineWidth(4)
        .strokeColor("#B45309")
        .stroke();

      doc
        .rect(26, 26, width - 52, height - 52)
        .lineWidth(1.5)
        .strokeColor("#1E3A8A")
        .stroke();

      // Top Background Accent Banner
      doc
        .rect(28, 28, width - 56, 55)
        .fillColor("#F8FAFC")
        .fill();

      // Header Brand Text
      doc
        .fillColor("#1E3A8A")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("VOLUNTEERHUB", 0, 44, { align: "center" });

      doc
        .fillColor("#64748B")
        .fontSize(9)
        .font("Helvetica")
        .text("NATIONAL VOLUNTEER MANAGEMENT SYSTEM", 0, 64, { align: "center" });

      // Certificate Title
      doc
        .fillColor("#B45309")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("CERTIFICATE OF PARTICIPATION", 0, 125, { align: "center" });

      doc
        .fillColor("#64748B")
        .fontSize(12)
        .font("Helvetica-Oblique")
        .text("This certificate is proudly awarded to", 0, 170, { align: "center" });

      // Volunteer Name
      const volunteerName = certificate.volunteer?.name || certificate.volunteerName || "Valued Volunteer";
      doc
        .fillColor("#0F172A")
        .fontSize(32)
        .font("Helvetica-Bold")
        .text(volunteerName, 0, 200, { align: "center" });

      // Underline accent for name
      const nameWidth = doc.widthOfString(volunteerName);
      const startX = (width - nameWidth) / 2;
      doc
        .moveTo(Math.max(startX - 20, 100), 240)
        .lineTo(Math.min(startX + nameWidth + 20, width - 100), 240)
        .lineWidth(1)
        .strokeColor("#CBD5E1")
        .stroke();

      // Service Statement
      const eventTitle = certificate.event?.title || certificate.eventName || "Community Service Event";
      const hours = certificate.hours || 4;
      const organizerName = certificate.event?.User?.name || certificate.issuer?.name || certificate.organizer || "Student Club";

      doc
        .fillColor("#334155")
        .fontSize(13)
        .font("Helvetica")
        .text(
          `for successfully participating and completing ${hours} hours of voluntary service in`,
          0,
          260,
          { align: "center" }
        );

      doc
        .fillColor("#1E3A8A")
        .fontSize(18)
        .font("Helvetica-Bold")
        .text(`"${eventTitle}"`, 0, 285, { align: "center" });

      doc
        .fillColor("#475569")
        .fontSize(12)
        .font("Helvetica")
        .text(`organized by ${organizerName}`, 0, 315, { align: "center" });

      // Signatures & Verification Footer Row
      const footerY = height - 120;
      const certNum = certificate.certificateNumber || `CERT-${certificate.id}`;
      const issueDate = certificate.issueDate || new Date().toISOString().split("T")[0];

      // Left: Issue Date & Cert ID
      doc
        .fillColor("#0F172A")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(`Issue Date: ${issueDate}`, 60, footerY);

      doc
        .fillColor("#64748B")
        .fontSize(9)
        .font("Helvetica")
        .text(`Cert ID: ${certNum}`, 60, footerY + 16);

      // Center: Official Stamp / Verification
      doc
        .rect(width / 2 - 60, footerY - 10, 120, 50)
        .lineWidth(1)
        .strokeColor("#CBD5E1")
        .stroke();

      doc
        .fillColor("#B45309")
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("OFFICIAL VERIFIED", width / 2 - 50, footerY, { width: 100, align: "center" });

      doc
        .fillColor("#64748B")
        .fontSize(8)
        .font("Helvetica")
        .text("VolunteerHub Registry", width / 2 - 50, footerY + 14, { width: 100, align: "center" });

      // Right: Authorized Signature Line
      const rightX = width - 240;
      doc
        .moveTo(rightX, footerY + 15)
        .lineTo(rightX + 180, footerY + 15)
        .lineWidth(1)
        .strokeColor("#94A3B8")
        .stroke();

      doc
        .fillColor("#0F172A")
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("Authorized Signature", rightX, footerY + 22, { width: 180, align: "center" });

      doc
        .fillColor("#64748B")
        .fontSize(8)
        .font("Helvetica")
        .text(`${organizerName} Coordinator`, rightX, footerY + 36, { width: 180, align: "center" });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Download certificate as a dynamic PDF file.
 */
export const downloadCertificate = async (req, res, next) => {
  try {
    const certificate = await certificateService.getCertificateById(req.params.id, req.user.id, req.user.role);
    const pdfBuffer = await buildCertificatePdfBuffer(certificate);

    const certNum = certificate.certificateNumber || certificate.id;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=certificate-${certNum}.pdf`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves global leaderboard.
 */
export const getLeaderboard = async (req, res, next) => {
  try {
    const leaderboard = await certificateService.getLeaderboard();
    res.status(200).json(leaderboard);
  } catch (error) {
    next(error);
  }
};

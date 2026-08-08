import { Op } from "sequelize";
import Certificate from "../models/certificateModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";
import Attendance from "../models/attendanceModel.js";
import AuditLog from "../models/auditLogModel.js";
import { createNotification } from "./notificationService.js";
import { sendCertificateIssuedEmail } from "../utils/emailService.js";
import StudentProfile from "../models/studentProfileModel.js";
import sequelize from "../config/database.js";

/**
 * Retrieves eligible volunteers for an event (Organizer only).
 */
export const getEligibleVolunteers = async (eventId, organizerId) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  if (event.UserId !== organizerId) {
    const err = new Error("Not authorized");
    err.statusCode = 403;
    throw err;
  }

  // Approved applications
  const registrations = await VolunteerRegistration.findAll({
    where: { EventId: eventId, status: "Approved" },
    include: [{ model: User, as: "volunteer", attributes: ["id", "name", "email"] }]
  });

  // Present attendances
  const attendances = await Attendance.findAll({
    where: { EventId: eventId, status: "Present" }
  });
  const presentUserIds = new Set(attendances.map((a) => a.UserId));

  // Already issued certificates
  const issuedCerts = await Certificate.findAll({
    where: { EventId: eventId }
  });
  const certifiedUserIds = new Set(issuedCerts.map((c) => c.UserId));

  return registrations
    .filter((reg) => presentUserIds.has(reg.UserId) && !certifiedUserIds.has(reg.UserId))
    .map((reg) => ({
      userId: reg.volunteer.id,
      name: reg.volunteer.name,
      email: reg.volunteer.email,
      attendanceStatus: "Present",
      hoursCompleted: 4, // Default hours completion
      reputationPoints: event.reputationPoints || 10
    }));
};

/**
 * Generates a certificate for a student (Organizer only).
 */
export const generateCertificate = async (eventId, userId, hours, organizerId) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  if (event.UserId !== organizerId) {
    const err = new Error("Not authorized");
    err.statusCode = 403;
    throw err;
  }

  // Eligibility validation
  const reg = await VolunteerRegistration.findOne({
    where: { EventId: eventId, UserId: userId, status: "Approved" }
  });
  const att = await Attendance.findOne({
    where: { EventId: eventId, UserId: userId, status: "Present" }
  });
  if (!reg || !att) {
    const err = new Error("Volunteer is not eligible for certificate");
    err.statusCode = 400;
    throw err;
  }

  // Prevent duplicates
  const exists = await Certificate.findOne({
    where: { EventId: eventId, UserId: userId }
  });
  if (exists) {
    const err = new Error("Certificate already generated for this volunteer and event");
    err.statusCode = 400;
    throw err;
  }

  const transaction = await sequelize.transaction();
  try {
    const certificate = await Certificate.create({
      UserId: userId,
      EventId: eventId,
      hours,
      issuedBy: organizerId,
      issueDate: new Date().toISOString().split("T")[0]
    }, { transaction });

    const student = await User.findByPk(userId, { transaction });
    const studentName = student ? student.name : 'Volunteer';

    // Create Notification
    await createNotification({
      userId,
      title: "Certificate Issued! 🎓",
      message: `Congratulations ${studentName}! Your official volunteer certificate for "${event?.title || 'the event'}" has been issued and is available for download.`,
      role: "student"
    }, { transaction });

    // Create Audit Log
    await AuditLog.create({
      action: "CERTIFICATE_GENERATED",
      performedById: organizerId,
      details: String(eventId) + String(userId)
    }, { transaction });

    await transaction.commit();

    // Trigger Email Notification asynchronously
    if (student && student.email) {
      sendCertificateIssuedEmail({
        to: student.email,
        userName: studentName,
        eventTitle: event?.title || "Volunteer Event",
        certificateNumber: certificate.certificateNumber
      }).catch(err => console.error("[EMAIL ERROR] Certificate email failed:", err.message));
    }

    return certificate;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Bulk generates certificates for all eligible volunteers.
 */
export const bulkGenerateCertificates = async (eventId, volunteers, organizerId) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  if (event.UserId !== organizerId) {
    const err = new Error("Not authorized");
    err.statusCode = 403;
    throw err;
  }

  const generatedList = [];

  for (const item of volunteers) {
    try {
      const cert = await generateCertificate(eventId, item.userId, item.hours || 4, organizerId);
      generatedList.push(cert);
    } catch (err) {
      // Skip duplicates or eligibility errors silently as per bulk instructions
      if (err.statusCode === 400) {
        continue;
      }
      throw err;
    }
  }

  return {
    message: "Bulk certificate generation completed",
    generatedCount: generatedList.length
  };
};

/**
 * Retrieves certificates for a student.
 */
export const getStudentCertificates = async (studentId) => {
  const certs = await Certificate.findAll({
    where: { UserId: studentId },
    include: [{ model: Event, as: "event" }],
    order: [["issueDate", "DESC"]]
  });

  return certs.map((c) => ({
    id: c.id,
    certificateNumber: c.certificateNumber,
    eventName: c.event?.title || "Unknown Event",
    issueDate: c.issueDate,
    hours: c.hours,
    reputationPointsEarned: c.event?.reputationPoints || 10
  }));
};

/**
 * Retrieves certificate detail record.
 */
export const getCertificateById = async (certificateId, userId, userRole) => {
  const certificate = await Certificate.findByPk(certificateId, {
    include: [
      {
        model: User,
        as: "volunteer",
        attributes: ["id", "name", "email"]
      },
      {
        model: Event,
        as: "event",
        include: [{ model: User, attributes: ["id", "name", "email"] }] // Organizer
      }
    ]
  });

  if (!certificate) {
    const err = new Error("Certificate not found");
    err.statusCode = 404;
    throw err;
  }

  // Authorization checks
  if (userRole === "student" && certificate.UserId !== userId) {
    const err = new Error("Access denied: You can only view your own certificates");
    err.statusCode = 403;
    throw err;
  }

  if (userRole === "organizer" && certificate.event.UserId !== userId) {
    const err = new Error("Access denied: You can only view certificates issued from your own events");
    err.statusCode = 403;
    throw err;
  }

  if (userRole !== "admin" && userRole !== "student" && userRole !== "organizer") {
    const err = new Error("Access denied");
    err.statusCode = 403;
    throw err;
  }

  return certificate;
};

/**
 * Retrieves the global leaderboard list.
 */
export const getLeaderboard = async () => {
  const leaderboard = await User.findAll({
    where: {
      role: "student",
      [Op.and]: [
        { name: { [Op.notLike]: "%Student One%" } },
        { name: { [Op.notLike]: "%Student Two%" } },
        { name: { [Op.notLike]: "%Test Student%" } },
        { name: { [Op.notLike]: "%Absent Student%" } },
        { name: { [Op.notLike]: "%Notif Student%" } },
        { email: { [Op.notLike]: "%student_%@uni.lk" } },
        { email: { [Op.notLike]: "%test_%@test.com" } }
      ]
    },
    attributes: [
      "id",
      "name",
      [
        sequelize.literal(`(
          SELECT COALESCE(SUM(c.hours), 0)
          FROM Certificates AS c
          WHERE c.UserId = User.id
        )`),
        "totalHours"
      ],
      [
        sequelize.literal(`(
          SELECT COUNT(*)
          FROM Certificates AS c
          WHERE c.UserId = User.id
        )`),
        "totalCertificates"
      ],
      [
        sequelize.literal(`(
          SELECT COALESCE(SUM(e.reputationPoints), 0)
          FROM Attendances AS a
          INNER JOIN Events AS e ON a.EventId = e.id
          WHERE a.UserId = User.id
            AND a.status = 'Present'
            AND e.approvalStatus = 'Approved'
        )`),
        "reputationPoints"
      ]
    ],
    include: [
      {
        model: StudentProfile,
        as: "studentProfile",
        attributes: ["faculty", "privacy"]
      }
    ],
    order: [
      [sequelize.literal("reputationPoints"), "DESC"]
    ]
  });

  return leaderboard
    .filter(student => {
      const privacy = student.studentProfile?.privacy;
      if (privacy && typeof privacy === 'object' && privacy.showProfileOnLeaderboard === false) {
        return false;
      }
      return true;
    })
    .map(student => ({
      id: student.id,
      name: student.name,
      faculty: student.studentProfile?.faculty || "General",
      totalCertificates: parseInt(student.getDataValue("totalCertificates"), 10) || 0,
      totalHours: parseInt(student.getDataValue("totalHours"), 10) || 0,
      reputationPoints: parseInt(student.getDataValue("reputationPoints"), 10) || 0
    }));
};

import Attendance from "../models/attendanceModel.js";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";
import AuditLog from "../models/auditLogModel.js";
import sequelize from "../config/database.js";

/**
 * Retrieves attendees for a specific event (Organizer only).
 */
export const getAttendeesForEvent = async (eventId, organizerId) => {
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

  // Approved volunteers
  const registrations = await VolunteerRegistration.findAll({
    where: { EventId: eventId, status: "Approved" },
    include: [{ model: User, as: "volunteer", attributes: ["id", "name", "email"] }]
  });

  // Fetch saved attendance records
  const existingRecords = await Attendance.findAll({ where: { EventId: eventId } });
  const attendanceMap = {};
  existingRecords.forEach((rec) => {
    attendanceMap[rec.UserId] = rec.status;
  });

  return registrations.map((reg) => {
    const volunteerStatus = attendanceMap[reg.volunteer.id] || "Absent";
    return {
      userId: reg.volunteer.id,
      name: reg.volunteer.name,
      email: reg.volunteer.email,
      status: volunteerStatus,
      eligibleForCertificate: reg.status === "Approved" && volunteerStatus === "Present"
    };
  });
};

/**
 * Marks attendance for a single volunteer (Organizer only).
 */
export const markAttendance = async (eventId, userId, status, organizerId) => {
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

  // Verify volunteer application is approved
  const registration = await VolunteerRegistration.findOne({
    where: { EventId: eventId, UserId: userId, status: "Approved" }
  });
  if (!registration) {
    const err = new Error("Only approved volunteers can be marked for attendance");
    err.statusCode = 400;
    throw err;
  }

  // Upsert attendance record
  await Attendance.upsert({
    EventId: eventId,
    UserId: userId,
    status,
    markedBy: organizerId
  });

  // Create Audit Log
  await AuditLog.create({
    action: "ATTENDANCE_MARKED",
    performedById: organizerId,
    details: String(eventId) + String(userId)
  });

  const record = await Attendance.findOne({
    where: { EventId: eventId, UserId: userId }
  });

  return {
    ...record.toJSON(),
    eligibleForCertificate: status === "Present"
  };
};

/**
 * Bulk marks attendance for multiple volunteers (Organizer only).
 */
export const bulkMarkAttendance = async (eventId, attendees, organizerId) => {
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

  // Get approved volunteer registrations
  const userIds = attendees.map((a) => a.userId);
  const approvedRegs = await VolunteerRegistration.findAll({
    where: { EventId: eventId, UserId: userIds, status: "Approved" }
  });
  const approvedUserIds = new Set(approvedRegs.map((r) => r.UserId));

  // Validate all are approved
  for (const attendee of attendees) {
    if (!approvedUserIds.has(attendee.userId)) {
      const err = new Error(`Only approved volunteers can be marked for attendance. User ID ${attendee.userId} is not approved.`);
      err.statusCode = 400;
      throw err;
    }
  }

  // Save all within transaction
  const transaction = await sequelize.transaction();
  try {
    for (const attendee of attendees) {
      await Attendance.upsert({
        EventId: eventId,
        UserId: attendee.userId,
        status: attendee.status,
        markedBy: organizerId
      }, { transaction });

      await AuditLog.create({
        action: "ATTENDANCE_MARKED",
        performedById: organizerId,
        details: String(eventId) + String(attendee.userId)
      }, { transaction });
    }
    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }

  return { message: "Attendance bulk-saved successfully" };
};

/**
 * Retrieves attendance records for a student.
 */
export const getStudentAttendance = async (studentId) => {
  const records = await Attendance.findAll({
    where: { UserId: studentId },
    include: [
      {
        model: Event,
        as: "event",
        include: [{ model: User, attributes: ["id", "name", "email"] }] // Organizer
      }
    ],
    order: [["createdAt", "DESC"]]
  });

  return await Promise.all(records.map(async (rec) => {
    const registration = await VolunteerRegistration.findOne({
      where: { UserId: studentId, EventId: rec.EventId }
    });
    const eligible = registration && registration.status === "Approved" && rec.status === "Present";
    return {
      id: rec.id,
      status: rec.status,
      date: rec.createdAt,
      event: {
        id: rec.event.id,
        title: rec.event.title,
        eventDate: rec.event.eventDate
      },
      organizer: {
        id: rec.event.User?.id,
        name: rec.event.User?.name
      },
      eligibleForCertificate: !!eligible
    };
  }));
};

/**
 * Retrieves attendance details by ID with authorization checks.
 */
export const getAttendanceById = async (attendanceId, userId, userRole) => {
  const attendance = await Attendance.findByPk(attendanceId, {
    include: [
      {
        model: User,
        as: "volunteer",
        attributes: ["id", "name", "email"]
      },
      {
        model: Event,
        as: "event",
        include: [{ model: User, attributes: ["id", "name", "email"] }]
      }
    ]
  });

  if (!attendance) {
    const err = new Error("Attendance record not found");
    err.statusCode = 404;
    throw err;
  }

  // Authorization checks
  if (userRole === "student" && attendance.UserId !== userId) {
    const err = new Error("Access denied: You can only view your own attendance");
    err.statusCode = 403;
    throw err;
  }

  if (userRole === "organizer" && attendance.event.UserId !== userId) {
    const err = new Error("Access denied: You can only view attendance for your own events");
    err.statusCode = 403;
    throw err;
  }

  if (userRole !== "admin" && userRole !== "student" && userRole !== "organizer") {
    const err = new Error("Access denied");
    err.statusCode = 403;
    throw err;
  }

  const registration = await VolunteerRegistration.findOne({
    where: { UserId: attendance.UserId, EventId: attendance.EventId }
  });
  const eligible = registration && registration.status === "Approved" && attendance.status === "Present";

  return {
    ...attendance.toJSON(),
    eligibleForCertificate: !!eligible
  };
};

/**
 * Retrieves attendance statistics.
 */
export const getAttendanceStats = async (organizerId) => {
  const myEvents = await Event.findAll({
    where: { UserId: organizerId },
    attributes: ["id"]
  });
  const eventIds = myEvents.map((e) => e.id);

  if (eventIds.length === 0) {
    return {
      totalApproved: 0,
      totalPresent: 0,
      totalAbsent: 0,
      attendanceRate: "0%"
    };
  }

  const totalApproved = await VolunteerRegistration.count({
    where: { EventId: eventIds, status: "Approved" }
  });

  const totalPresent = await Attendance.count({
    where: { EventId: eventIds, status: "Present" }
  });

  const totalAbsent = totalApproved - totalPresent;

  const attendanceRate = totalApproved > 0
    ? Math.round((totalPresent / totalApproved) * 100) + "%"
    : "0%";

  return {
    totalApproved,
    totalPresent,
    totalAbsent,
    attendanceRate
  };
};

import { Op } from "sequelize";
import sequelize from "../config/database.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";
import Certificate from "../models/certificateModel.js";
import Attendance from "../models/attendanceModel.js";
import StudentProfile from "../models/studentProfileModel.js";
import OrganizerProfile from "../models/organizerProfileModel.js";

// GET /api/admin/reports/overview
export const getOverviewStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStudents = await User.count({ where: { role: 'student' } });
    const totalOrganizers = await User.count({ where: { role: 'organizer' } });
    const totalEvents = await Event.count({ where: { status: { [Op.ne]: 'Archived' } } });
    const approvedEvents = await Event.count({ where: { approvalStatus: 'Approved', status: { [Op.ne]: 'Archived' } } });
    const pendingEvents = await Event.count({ where: { approvalStatus: 'Pending', status: { [Op.ne]: 'Archived' } } });
    const rejectedEvents = await Event.count({ where: { approvalStatus: 'Rejected', status: { [Op.ne]: 'Archived' } } });
    const totalApplications = await VolunteerRegistration.count();
    const approvedApplications = await VolunteerRegistration.count({ where: { status: 'Approved' } });
    const totalCertificates = await Certificate.count();
    const totalAttendanceRecords = await Attendance.count();

    res.status(200).json({
      totalUsers,
      totalStudents,
      totalOrganizers,
      totalEvents,
      approvedEvents,
      pendingEvents,
      rejectedEvents,
      totalApplications,
      approvedApplications,
      totalCertificates,
      totalAttendanceRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/reports/user-growth
export const getUserGrowth = async (req, res) => {
  try {
    const registrations = await User.findAll({
      attributes: [
        [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"), "month"],
        [sequelize.fn("SUM", sequelize.literal("CASE WHEN role = 'student' THEN 1 ELSE 0 END")), "students"],
        [sequelize.fn("SUM", sequelize.literal("CASE WHEN role = 'organizer' THEN 1 ELSE 0 END")), "organizers"]
      ],
      where: {
        role: ["student", "organizer"]
      },
      group: [sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m")],
      order: [[sequelize.fn("DATE_FORMAT", sequelize.col("createdAt"), "%Y-%m"), "ASC"]],
      raw: true
    });

    const growth = registrations.map(r => ({
      month: r.month,
      students: parseInt(r.students, 10) || 0,
      organizers: parseInt(r.organizers, 10) || 0
    }));

    res.status(200).json(growth);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/reports/events
export const getEventReport = async (req, res) => {
  try {
    const totalEvents = await Event.count({ where: { status: { [Op.ne]: 'Archived' } } });
    const upcomingEvents = await Event.count({ where: { status: 'Upcoming' } });
    const activeEvents = await Event.count({ where: { status: 'Active' } });
    const completedEvents = await Event.count({ where: { status: 'Completed' } });
    const archivedEvents = await Event.count({ where: { status: 'Archived' } });

    res.status(200).json({
      totalEvents,
      upcomingEvents,
      activeEvents,
      completedEvents,
      archivedEvents
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/reports/applications
export const getApplicationReport = async (req, res) => {
  try {
    const totalApplications = await VolunteerRegistration.count();
    const approvedApplications = await VolunteerRegistration.count({ where: { status: 'Approved' } });
    const rejectedApplications = await VolunteerRegistration.count({ where: { status: 'Rejected' } });
    const pendingApplications = await VolunteerRegistration.count({ where: { status: 'Pending' } });
    const approvalRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(2) + "%" : "0%";

    res.status(200).json({
      totalApplications,
      approvedApplications,
      rejectedApplications,
      pendingApplications,
      approvalRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/reports/certificates
export const getCertificateReport = async (req, res) => {
  try {
    const totalCertificates = await Certificate.count();
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const certificatesThisMonth = await Certificate.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    const avgResult = await Certificate.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("hours")), "avgHours"]
      ],
      raw: true
    });
    const avgHours = avgResult?.avgHours || 0;
    const averageHoursPerVolunteer = parseFloat(parseFloat(avgHours).toFixed(2));

    res.status(200).json({
      totalCertificates,
      certificatesThisMonth,
      averageHoursPerVolunteer
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/admin/reports/top-organizations
export const getTopOrganizations = async (req, res) => {
  try {
    const organizers = await User.findAll({
      where: { role: 'organizer' },
      attributes: [
        "name",
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM Events AS e
            WHERE e.UserId = User.id
              AND e.status != 'Archived'
          )`),
          "eventsCreated"
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM VolunteerRegistrations AS vr
            INNER JOIN Events AS e ON vr.EventId = e.id
            WHERE e.UserId = User.id
          )`),
          "applicationsReceived"
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM Certificates AS c
            INNER JOIN Events AS e ON c.EventId = e.id
            WHERE e.UserId = User.id
          )`),
          "certificatesIssued"
        ]
      ],
      include: [
        {
          model: OrganizerProfile,
          as: "organizerProfile",
          attributes: ["organizationName"]
        }
      ],
      order: [
        [sequelize.literal("eventsCreated"), "DESC"]
      ]
    });

    const list = organizers.map(org => ({
      organization: org.organizerProfile?.organizationName || org.name,
      eventsCreated: parseInt(org.getDataValue("eventsCreated"), 10) || 0,
      applicationsReceived: parseInt(org.getDataValue("applicationsReceived"), 10) || 0,
      certificatesIssued: parseInt(org.getDataValue("certificatesIssued"), 10) || 0
    }));

    res.status(200).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/organizer/reports/dashboard
export const getOrganizerDashboard = async (req, res) => {
  try {
    const organizerId = req.user.id;
    const totalEvents = await Event.count({ where: { UserId: organizerId } });
    const activeEvents = await Event.count({ where: { UserId: organizerId, status: 'Active' } });

    const totalApplications = await VolunteerRegistration.count({
      include: [{
        model: Event,
        as: "event",
        where: { UserId: organizerId }
      }]
    });

    const approvedVolunteers = await VolunteerRegistration.count({
      where: { status: 'Approved' },
      include: [{
        model: Event,
        as: "event",
        where: { UserId: organizerId }
      }]
    });

    const certificatesIssued = await Certificate.count({
      include: [{
        model: Event,
        as: "event",
        where: { UserId: organizerId }
      }]
    });

    const totalPresent = await Attendance.count({
      where: { status: 'Present' },
      include: [{
        model: Event,
        as: "event",
        where: { UserId: organizerId }
      }]
    });

    const attendanceRate = approvedVolunteers > 0 ? ((totalPresent / approvedVolunteers) * 100).toFixed(2) + "%" : "0%";

    res.status(200).json({
      totalEvents,
      activeEvents,
      totalApplications,
      approvedVolunteers,
      certificatesIssued,
      attendanceRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/organizer/reports/event/:eventId
export const getEventPerformance = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user.id;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.UserId !== organizerId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const applications = await VolunteerRegistration.count({ where: { EventId: eventId } });
    const approvedVolunteers = await VolunteerRegistration.count({ where: { EventId: eventId, status: 'Approved' } });
    const attendanceCount = await Attendance.count({ where: { EventId: eventId, status: 'Present' } });
    const certificatesIssued = await Certificate.count({ where: { EventId: eventId } });
    const completionRate = approvedVolunteers > 0 ? ((certificatesIssued / approvedVolunteers) * 100).toFixed(2) + "%" : "0%";

    res.status(200).json({
      applications,
      approvedVolunteers,
      attendanceCount,
      certificatesIssued,
      completionRate
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/reports/leaderboard
export const getLeaderboardReport = async (req, res) => {
  try {
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

    const formatted = leaderboard
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

    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

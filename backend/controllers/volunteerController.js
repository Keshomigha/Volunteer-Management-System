import sequelize from "../config/database.js";
import bcrypt from "bcryptjs";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";
import Attendance from "../models/attendanceModel.js";
import Certificate from "../models/certificateModel.js";
import { getSettings } from "../services/settingsService.js";
import StudentProfile from "../models/studentProfileModel.js";
import { createNotification } from "../services/notificationService.js";

// Student applies for an event → creates a Pending row
export const registerVolunteer = async (req, res) => {
  try {
    const settings = await getSettings();
    if (!settings.registrationOpen) {
      return res.status(400).json({ message: "Registrations are currently closed." });
    }

    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const exists = await VolunteerRegistration.findOne({
      where: { UserId: req.user.id, EventId: eventId },
    });
    if (exists) {
      return res.status(400).json({ message: "Already registered" });
    }

    const registration = await VolunteerRegistration.create({
      UserId: req.user.id,
      EventId: eventId,
      status: "Pending",
    });

    res.status(201).json({ message: "Applied successfully", registration });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Organizer sees all applications for their events
// JOIN fetches volunteer name+email and event title in one query
export const getApplicationsForOrganizer = async (req, res) => {
  try {
    // First find all events that belong to this organizer
    const myEvents = await Event.findAll({
      where: { UserId: req.user.id },
      attributes: ["id"],
    });
    const eventIds = myEvents.map((e) => e.id);

    if (eventIds.length === 0) {
      return res.status(200).json([]);
    }

    // Fetch registrations for those events, including volunteer and event details
    const applications = await VolunteerRegistration.findAll({
      where: { EventId: eventIds },
      include: [
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "name", "email"],
        },
        {
          model: Event,
          as: "event",
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Organizer approves or rejects a specific application
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "Approved" or "Rejected"

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be Approved or Rejected" });
    }

    const application = await VolunteerRegistration.findByPk(id, {
      include: [
        { model: Event, as: "event", attributes: ["title", "UserId"] },
        { model: User, as: "volunteer", attributes: ["name"] }
      ],
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Security check — organizer can only update applications for their own events
    if (application.event.UserId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this application" });
    }

    await application.update({ status });

    const eventTitle = application.event?.title || "the event";
    const studentName = application.volunteer?.name || "Volunteer";

    if (status === "Approved") {
      await createNotification({
        userId: application.UserId,
        title: "Application Approved! 🎉",
        message: `Congratulations ${studentName}! Your application for "${eventTitle}" has been approved.`,
        role: "student"
      });
    } else if (status === "Rejected") {
      await createNotification({
        userId: application.UserId,
        title: "Application Status Update",
        message: `Your application for "${eventTitle}" was not selected by the organizer at this time.`,
        role: "student"
      });
    }

    res.status(200).json({ message: `Application ${status}`, application });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Organizer views all volunteers for a specific event (used by Attendance page dropdown)
export const getVolunteers = async (req, res) => {
  try {
    const list = await VolunteerRegistration.findAll({
      where: { EventId: req.params.eventId, status: "Approved" },
      include: [
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    const result = list.map((r) => ({
      registrationId: r.id,
      userId: r.volunteer?.id,
      name: r.volunteer?.name,
      email: r.volunteer?.email,
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch student statistics and items for their dashboard (Joined events, hours, certificates, reputation points)
export const getStudentDashboardDetails = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Fetch joined events (all applications/registrations of the student)
    const registrations = await VolunteerRegistration.findAll({
      where: { UserId: studentId },
      include: [
        {
          model: Event,
          as: "event",
          include: [
            {
              model: User,
              attributes: ["name"]
            }
          ]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // 2. Fetch certificates
    const certificates = await Certificate.findAll({
      where: { UserId: studentId },
      include: [
        {
          model: Event,
          as: "event"
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // 3. Fetch attendance (Present records) for hours calculation
    const attendances = await Attendance.findAll({
      where: { UserId: studentId, status: "Present" },
      include: [
        {
          model: Event,
          as: "event"
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Map joined events
    const joinedEvents = registrations.map(reg => {
      const ev = reg.event;
      if (!ev) return null;
      return {
        id: reg.id,
        eventId: ev.id,
        title: ev.title,
        organizer: ev.User?.name || 'Student Club',
        date: ev.eventDate,
        location: ev.location,
        image: ev.image,
        applicationStatus: reg.status,
        attendanceStatus: 'Absent'
      };
    }).filter(Boolean);

    // Populate the correct attendance status for joined events
    const allStudentAttendances = await Attendance.findAll({
      where: { UserId: studentId }
    });
    joinedEvents.forEach(je => {
      const att = allStudentAttendances.find(a => a.EventId === je.eventId);
      if (att) {
        je.attendanceStatus = att.status;
      }
    });

    // Map certificates
    const certificatesList = certificates.map(cert => ({
      id: cert.id,
      certificateId: `CERT-${String(cert.id).padStart(4, '0')}`,
      event: cert.event?.title || 'Volunteer Event',
      organizer: 'VolunteerHub',
      completedOn: cert.issueDate,
      hours: cert.hours,
      volunteerName: req.user.name,
      reputationPoints: cert.event?.reputationPoints || 10
    }));

    // Map volunteer hours history
    let totalHours = 0;
    const hoursLog = [];

    // Use certificates for hours history first
    certificates.forEach(c => {
      totalHours += c.hours;
      hoursLog.push({
        id: `c-${c.id}`,
        event: c.event?.title || 'Volunteer Event',
        hours: c.hours,
        date: c.issueDate
      });
    });

    // If there are present attendances not covered by certificates, add them to hours history
    attendances.forEach(att => {
      const alreadyInLog = hoursLog.some(log => log.event === att.event?.title);
      if (!alreadyInLog && att.event) {
        const estHours = 4; // default hours for event
        totalHours += estHours;
        hoursLog.push({
          id: `a-${att.id}`,
          event: att.event.title,
          hours: estHours,
          date: att.createdAt.toISOString().split('T')[0]
        });
      }
    });

    // Calculate reputation score from approved registrations
    const approvedEvents = registrations.filter(r => r.status === "Approved" || r.status === "approved");
    let reputationScore = 0;
    const reputationActivities = [];

    approvedEvents.forEach(reg => {
      const ev = reg.event;
      if (ev) {
        const pts = ev.reputationPoints || 10;
        reputationScore += pts;
        reputationActivities.push({
          id: reg.id,
          event: ev.title,
          points: pts,
          date: reg.updatedAt.toISOString().split('T')[0]
        });
      }
    });

    // Determine Rank Level
    let rankLevel = "Beginner Volunteer";
    if (reputationScore >= 600) rankLevel = "Volunteer Champion";
    else if (reputationScore >= 300) rankLevel = "Community Leader";
    else if (reputationScore >= 100) rankLevel = "Active Volunteer";

    res.status(200).json({
      joinedEventsCount: joinedEvents.length,
      reputationPoints: reputationScore,
      certificatesCount: certificatesList.length,
      volunteerHours: totalHours,
      joinedEvents,
      certificates: certificatesList,
      hoursHistory: hoursLog,
      reputationActivities,
      rankLevel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /settings
export const getStudentSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phone"],
      include: [
        {
          model: StudentProfile,
          as: "studentProfile",
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      studentId: user.studentProfile?.studentId || "",
      faculty: user.studentProfile?.faculty || "",
      university: user.studentProfile?.university || "State University",
      degreeProgram: user.studentProfile?.degreeProgram || "",
      yearOfStudy: user.studentProfile?.yearOfStudy || "1st Year",
      bio: user.studentProfile?.bio || "",
      avatar: user.studentProfile?.avatar || "",
      skills: user.studentProfile?.skills || [],
      preferences: user.studentProfile?.preferences || [],
      availability: user.studentProfile?.availability || { days: [], times: [] },
      notifications: user.studentProfile?.notifications || {
        eventRecommendations: true,
        applicationUpdates: true,
        eventReminders: true,
        certificateNotifications: true,
        reputationPointUpdates: true,
      },
      privacy: user.studentProfile?.privacy || {
        showProfileOnLeaderboard: true,
        allowOrganizersToViewSkills: true,
        receivePersonalizedRecommendations: true,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /settings
export const updateStudentSettings = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      phone,
      faculty,
      university,
      degreeProgram,
      yearOfStudy,
      bio,
      avatar,
      skills,
      preferences,
      availability,
      notifications,
      privacy,
      studentId
    } = req.body;

    // Update User details
    await User.update(
      { name, phone },
      { where: { id: req.user.id }, transaction }
    );

    // Prepare profile values to update
    const profileUpdates = {
      faculty,
      university,
      degreeProgram,
      yearOfStudy,
      bio,
      avatar,
      skills,
      preferences,
      availability,
      notifications,
      privacy,
    };

    if (studentId) {
      if (/^STU\d{6}$/.test(studentId)) {
        const existingProfile = await StudentProfile.findOne({
          where: { studentId },
          transaction
        });
        if (existingProfile && existingProfile.userId !== req.user.id) {
          await transaction.rollback();
          return res.status(400).json({ message: "Student ID is already in use by another user." });
        }
        profileUpdates.studentId = studentId;
      } else {
        await transaction.rollback();
        return res.status(400).json({ message: "Student ID must be in format STUxxxxxx (e.g. STU123456)" });
      }
    }

    // Update StudentProfile details
    await StudentProfile.update(
      profileUpdates,
      { where: { userId: req.user.id }, transaction }
    );

    await transaction.commit();

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phone", "role"],
      include: [{ model: StudentProfile, as: "studentProfile" }]
    });

    res.status(200).json({
      message: "Settings updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        studentProfile: updatedUser.studentProfile,
      }
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

// PUT /change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid current password." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

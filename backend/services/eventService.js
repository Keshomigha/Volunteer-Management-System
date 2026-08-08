import { Op } from "sequelize";
import Event from "../models/eventModel.js";
import User from "../models/userModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";
import Attendance from "../models/attendanceModel.js";
import StudentProfile from "../models/studentProfileModel.js";
import { createNotification } from "./notificationService.js";
import { getSettings } from "./settingsService.js";

/**
 * Service to handle core event business logic and lifecycles.
 */
export const createEvent = async (eventData, organizerId) => {
  const organizer = await User.findByPk(organizerId);
  const orgName = organizer ? organizer.name : 'An Organizer';
  const settings = await getSettings();
  const isApprovalRequired = settings.eventApprovalRequired !== false;

  const event = await Event.create({
    ...eventData,
    image: eventData.image || "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800",
    UserId: organizerId,
    approvalStatus: isApprovalRequired ? "Pending" : "Approved",
    status: "Upcoming",
    acceptedCount: 0
  });

  if (isApprovalRequired) {
    await createNotification({
      userId: null,
      title: "New Event Submission",
      message: `${orgName} submitted a new event "${event.title}" awaiting your approval.`,
      role: "admin"
    });
  }

  return event;
};

export const updateEvent = async (eventId, eventData, organizerId, userRole) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  // Ownership check
  if (userRole !== "admin" && event.UserId !== organizerId) {
    const err = new Error("You can edit only your events");
    err.statusCode = 403;
    throw err;
  }

  // Archived check
  if (userRole !== "admin" && event.status === "Archived") {
    const err = new Error("Cannot edit archived events");
    err.statusCode = 400;
    throw err;
  }

  // Prevent direct modifications of keys/status columns during updates
  const updateData = { ...eventData };
  delete updateData.id;
  delete updateData.UserId;
  delete updateData.approvalStatus; // Maintain approval status

  await event.update(updateData);
  return event;
};

export const deleteEvent = async (eventId, userId, userRole) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  // Security Check: Only event owner or admin can delete
  if (userRole !== "admin" && event.UserId !== userId) {
    const err = new Error("You can delete only your events");
    err.statusCode = 403;
    throw err;
  }

  // Clean up associated registrations and attendance records, then destroy event
  await VolunteerRegistration.destroy({ where: { EventId: eventId } }).catch(() => {});
  await Attendance.destroy({ where: { EventId: eventId } }).catch(() => {});
  await event.destroy();
  return { id: eventId, message: "Event deleted successfully" };
};

export const getOrganizerEvents = async (organizerId) => {
  const events = await Event.findAll({
    where: { 
      UserId: organizerId,
      status: { [Op.ne]: "Archived" }
    },
    order: [["eventDate", "DESC"]]
  });

  // Include application counts
  const result = await Promise.all(events.map(async (e) => {
    const registrationsCount = await VolunteerRegistration.count({ where: { EventId: e.id } });
    const approvedCount = await VolunteerRegistration.count({ where: { EventId: e.id, status: "Approved" } });
    return {
      ...e.toJSON(),
      applicationsCount: registrationsCount,
      approvedVolunteersCount: approvedCount
    };
  }));

  return result;
};

export const getPublicEvents = async (filters) => {
  const { search, category, date } = filters;
  const whereClause = {
    approvalStatus: "Approved",
    status: {
      [Op.ne]: "Archived"
    }
  };

  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }

  if (category) {
    whereClause.category = category;
  }

  if (date) {
    whereClause.eventDate = date;
  }

  return await Event.findAll({
    where: whereClause,
    include: [{ model: User, attributes: ["name"] }],
    order: [["eventDate", "ASC"]]
  });
};

export const getEventDetails = async (eventId) => {
  const event = await Event.findByPk(eventId, {
    include: [{ model: User, attributes: ["id", "name", "email"] }]
  });

  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  const availableSlots = Math.max(0, event.volunteerRequired - event.acceptedCount);

  return {
    ...event.toJSON(),
    availableSlots
  };
};

export const getPendingEvents = async () => {
  return await Event.findAll({
    where: { approvalStatus: "Pending" },
    include: [{ model: User, attributes: ["name"] }]
  });
};

export const approveEvent = async (eventId) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  await event.update({ approvalStatus: "Approved" });

  await createNotification({
    userId: event.UserId,
    title: "Event Approved 🎉",
    message: `Great news! Your event "${event.title}" has been approved by the Admin and is now live for volunteers to browse and apply.`,
    role: "organizer"
  });

  return event;
};

export const rejectEvent = async (eventId) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    const err = new Error("Event not found");
    err.statusCode = 404;
    throw err;
  }

  await event.update({ approvalStatus: "Rejected" });

  await createNotification({
    userId: event.UserId,
    title: "Event Status Update",
    message: `Your event "${event.title}" was not approved by the Admin. Please review and update your event details.`,
    role: "organizer"
  });

  return event;
};

export const getOrganizerDashboardStats = async (organizerId) => {
  const todayStr = new Date().toISOString().split("T")[0];

  const myEvents = await Event.findAll({
    where: { UserId: organizerId, status: { [Op.ne]: "Archived" } },
    order: [["eventDate", "DESC"]]
  });

  const eventIds = myEvents.map((e) => e.id);

  if (eventIds.length === 0) {
    return {
      activeEvents: 0,
      totalApplications: 0,
      approvedVolunteersCount: 0,
      approvedVolunteers: [],
      successRate: "0%",
      myCreatedEvents: [],
      recentApplications: [],
      lineData: [],
      pieData: []
    };
  }

  const allApplications = await VolunteerRegistration.findAll({
    where: { EventId: eventIds },
    include: [
      { model: User, as: "volunteer", attributes: ["id", "name", "email"] },
      { model: Event, as: "event", attributes: ["id", "title"] }
    ],
    order: [["createdAt", "DESC"]]
  });

  const totalApplications = allApplications.length;
  const approvedApps = allApplications.filter((app) => app.status === "Approved");
  const approvedVolunteersCount = approvedApps.length;

  const activeEventsCount = myEvents.filter(
    (e) => e.approvalStatus === "Approved" && e.eventDate >= todayStr
  ).length;

  const successRateStr = totalApplications > 0
    ? Math.round((approvedVolunteersCount / totalApplications) * 100) + "%"
    : "0%";

  // 1. Line Chart: Applications Over Time (Past 6 Months)
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      month: d.toLocaleString("default", { month: "short" }),
      applications: 0
    });
  }

  allApplications.forEach((app) => {
    const d = new Date(app.createdAt);
    const match = months.find((m) => m.year === d.getFullYear() && m.monthIndex === d.getMonth());
    if (match) {
      match.applications++;
    }
  });

  const lineData = months.map((m) => ({
    month: m.month,
    applications: m.applications
  }));

  // 2. Pie Chart: Event Participation Rate (%) per event
  const pieData = myEvents.slice(0, 5).map((ev) => {
    const eventAppsCount = allApplications.filter((a) => a.EventId === ev.id).length;
    const percentage = totalApplications > 0 ? Math.round((eventAppsCount / totalApplications) * 100) : 0;
    return {
      name: ev.title,
      value: percentage
    };
  }).filter((p) => p.value > 0);

  // If no percentages calculated yet, return application counts
  if (pieData.length === 0 && myEvents.length > 0) {
    myEvents.slice(0, 5).forEach((ev) => {
      const cnt = allApplications.filter((a) => a.EventId === ev.id).length;
      pieData.push({
        name: ev.title,
        value: cnt
      });
    });
  }

  // 3. Approved Volunteers list with attendance
  const allAttendances = await Attendance.findAll({
    where: { EventId: eventIds }
  });

  const approvedVolunteersList = approvedApps.map((app) => {
    const att = allAttendances.find((a) => a.EventId === app.EventId && a.UserId === app.UserId);
    return {
      id: app.id,
      userId: app.UserId,
      eventId: app.EventId,
      name: app.volunteer?.name || app.User?.name || "Volunteer",
      email: app.volunteer?.email || app.User?.email || "",
      eventName: app.event?.title || "Event",
      attendanceStatus: att?.status || "Absent"
    };
  });

  return {
    activeEvents: activeEventsCount,
    totalApplications,
    approvedVolunteersCount,
    approvedVolunteers: approvedVolunteersList,
    successRate: successRateStr,
    lineData,
    pieData,
    myCreatedEvents: myEvents,
    recentApplications: allApplications.slice(0, 6)
  };
};

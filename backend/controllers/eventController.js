import * as eventService from "../services/eventService.js";
import User from "../models/userModel.js";
import Event from "../models/eventModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";
import Attendance from "../models/attendanceModel.js";
import StudentProfile from "../models/studentProfileModel.js";


export const createEvent = async (req, res, next) => {
  try {
    const event = await eventService.createEvent(req.body, req.user.id);
    res.status(201).json({
      success: true,
      message: "Event created successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const getEvents = async (req, res, next) => {
  try {
    const { search, category, date } = req.query;
    const events = await eventService.getPublicEvents({ search, category, date });
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventDetails(req.params.id);
    res.status(200).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await eventService.deleteEvent(req.params.id, req.user.id, req.user.role);
    res.status(200).json({
      success: true,
      message: "Event deleted (archived) successfully",
      event,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyEvents = async (req, res, next) => {
  try {
    const events = await eventService.getOrganizerEvents(req.user.id);
    res.status(200).json(events);
  } catch (error) {
    next(error);
  }
};

// Dashboard stats — counts for the logged-in organizer
export const getOrganizerStats = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Fetch all events created by this organizer
    const myEvents = await eventService.getOrganizerEvents(req.user.id);
    const eventIds = myEvents.map((e) => e.id);

    if (eventIds.length === 0) {
      return res.status(200).json({
        activeEvents: 0,
        totalApplications: 0,
        approvedVolunteers: 0,
        successRate: "0%",
        lineData: [
          { month: 'Jan', applications: 45 },
          { month: 'Feb', applications: 58 },
          { month: 'Mar', applications: 70 },
          { month: 'Apr', applications: 95 },
          { month: 'May', applications: 120 },
        ],
        pieData: [
          { name: 'Beach Cleanup',     value: 85 },
          { name: 'Tech Workshop',     value: 82 },
          { name: 'Tree Planting',     value: 78 },
          { name: 'Food Distribution', value: 95 },
        ],
        myCreatedEvents: [],
        recentApplications: [],
        approvedVolunteers: [],
        eventPerformanceSummary: [],
      });
    }

    // 2. Fetch all applications (VolunteerRegistrations) for these events
    const allApplications = await VolunteerRegistration.findAll({
      where: { EventId: eventIds },
      include: [
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "name", "email"],
          include: [
            {
              model: StudentProfile,
              as: "studentProfile",
              attributes: ["studentId", "faculty", "skills"],
            },
          ],
        },
        {
          model: Event,
          as: "event",
          attributes: ["id", "title"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 3. Fetch all attendance records for these events
    const allAttendance = await Attendance.findAll({
      where: { EventId: eventIds },
    });

    // counts calculations
    const totalApplications = allApplications.length;
    const approvedVolunteers = allApplications.filter((app) => app.status === "Approved").length;

    // activeEvents count: approved events whose date is >= today
    const activeEventsCount = myEvents.filter(
      (e) => e.approvalStatus === "Approved" && e.eventDate >= todayStr
    ).length;

    const successRateStr = totalApplications > 0
      ? Math.round((approvedVolunteers / totalApplications) * 100) + "%"
      : "0%";

    // Map My Created Events
    const myCreatedEvents = myEvents.map((e) => {
      let displayStatus = "Pending";
      if (e.approvalStatus === "Pending") displayStatus = "Pending";
      else if (e.approvalStatus === "Rejected") displayStatus = "Rejected";
      else if (e.approvalStatus === "Approved") {
        displayStatus = e.eventDate < todayStr ? "Completed" : "Approved";
      }

      return {
        id: e.id,
        image: e.image,
        title: e.title,
        category: e.category || "General",
        eventDate: e.eventDate,
        location: e.location,
        status: displayStatus,
        applicationsCount: e.applicationsCount,
        approvedVolunteersCount: e.approvedVolunteersCount,
      };
    });

    // Map Recent Applications
    const recentApplications = allApplications.map((app) => ({
      id: app.id,
      studentName: app.volunteer?.name || "Unknown",
      studentId: app.volunteer?.id,
      studentEmail: app.volunteer?.email,
      studentProfile: app.volunteer?.studentProfile || null,
      eventName: app.event?.title || "Unknown Event",
      eventId: app.EventId,
      appliedDate: app.createdAt.toISOString().split("T")[0],
      status: app.status,
    }));

    // Map Approved Volunteers
    const approvedVolunteersList = allApplications
      .filter((app) => app.status === "Approved")
      .map((app) => {
        const attendance = allAttendance.find(
          (att) => att.UserId === app.UserId && att.EventId === app.EventId
        );
        return {
          id: app.id,
          studentName: app.volunteer?.name || "Unknown",
          studentId: app.volunteer?.id,
          studentEmail: app.volunteer?.email,
          studentProfile: app.volunteer?.studentProfile || null,
          eventName: app.event?.title || "Unknown Event",
          eventId: app.EventId,
          approvalDate: app.updatedAt.toISOString().split("T")[0],
          attendanceStatus: attendance ? attendance.status : "Absent",
        };
      });

    // Map Event Performance Summary
    const eventPerformanceSummary = myEvents.map((e) => {
      const eventApps = allApplications.filter((app) => app.EventId === e.id);
      const applicationsReceived = eventApps.length;
      const approvedCount = eventApps.filter((app) => app.status === "Approved").length;
      const attendanceCount = allAttendance.filter(
        (att) => att.EventId === e.id && att.status === "Present"
      ).length;
      const successRate = approvedCount > 0
        ? Math.round((attendanceCount / approvedCount) * 100)
        : 0;

      return {
        id: e.id,
        eventName: e.title,
        applicationsReceived,
        approvedVolunteers: approvedCount,
        attendanceCount,
        successRate,
      };
    });

    // 4. Line Chart Data (Applications Over Time for last 5 months)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const lineData = [];
    const now = new Date();
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      const yearVal = d.getFullYear();
      const count = allApplications.filter((app) => {
        const appDate = new Date(app.createdAt);
        return appDate.getMonth() === d.getMonth() && appDate.getFullYear() === yearVal;
      }).length;
      lineData.push({ month: monthName, applications: count });
    }

    const hasApps = allApplications.length > 0;
    const finalLineData = hasApps ? lineData : [
      { month: 'Jan', applications: 45 },
      { month: 'Feb', applications: 58 },
      { month: 'Mar', applications: 70 },
      { month: 'Apr', applications: 95 },
      { month: 'May', applications: 120 },
    ];

    // Pie Chart Data (Participation Rate: top 4 events)
    const pieData = eventPerformanceSummary
      .slice(0, 4)
      .map((item) => ({
        name: item.eventName,
        value: item.successRate,
      }));

    const finalPieData = pieData.some((p) => p.value > 0) ? pieData : [
      { name: 'Beach Cleanup',     value: 85 },
      { name: 'Tech Workshop',     value: 82 },
      { name: 'Tree Planting',     value: 78 },
      { name: 'Food Distribution', value: 95 },
    ];

    res.status(200).json({
      activeEvents: activeEventsCount,
      totalApplications,
      approvedVolunteersCount: approvedVolunteers,
      successRate: successRateStr,
      lineData: finalLineData,
      pieData: finalPieData,
      myCreatedEvents,
      recentApplications,
      approvedVolunteers: approvedVolunteersList,
      eventPerformanceSummary,
    });
  } catch (error) {
    next(error);
  }
};
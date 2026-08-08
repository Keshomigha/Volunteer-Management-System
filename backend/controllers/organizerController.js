import { Op } from "sequelize";
import sequelize from "../config/database.js";
import User from "../models/userModel.js";
import OrganizerProfile from "../models/organizerProfileModel.js";
import Event from "../models/eventModel.js";
import VolunteerRegistration from "../models/volunteerRegistration.js";
import Certificate from "../models/certificateModel.js";

// GET /api/organizer/settings
// Returns the organizer's user info + organization profile joined together along with computed stats
export const getOrganizerSettings = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phone"],
      include: [{ model: OrganizerProfile, as: "organizerProfile" }],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Compute stats
    const eventsCreated = await Event.count({ where: { UserId: req.user.id, status: { [Op.ne]: "Archived" } } });
    
    const myEvents = await Event.findAll({
      where: { UserId: req.user.id, status: { [Op.ne]: "Archived" } },
      attributes: ["id"]
    });
    const eventIds = myEvents.map(e => e.id);

    let applicationsReceived = 0;
    let approvedVolunteers = 0;

    if (eventIds.length > 0) {
      applicationsReceived = await VolunteerRegistration.count({
        where: { EventId: eventIds }
      });
      approvedVolunteers = await VolunteerRegistration.count({
        where: { EventId: eventIds, status: "Approved" }
      });
    }

    const certificatesGenerated = await Certificate.count({
      where: { issuedBy: req.user.id }
    });

    res.status(200).json({
      orgName: user.organizerProfile?.organizationName || user.name,
      email: user.email,
      phone: user.phone || "",
      organizationType: user.organizerProfile?.organizationType || "IEEE",
      description: user.organizerProfile?.description || "",
      university: user.organizerProfile?.university || "",
      websiteUrl: user.organizerProfile?.websiteUrl || "",
      socialMediaLinks: user.organizerProfile?.socialMediaLinks || { facebook: "", twitter: "", linkedin: "", instagram: "" },
      members: user.organizerProfile?.members || [],
      eventPreferences: user.organizerProfile?.eventPreferences || { defaultCategory: "", defaultVolunteerLimit: 30, defaultEventLocation: "" },
      notifications: user.organizerProfile?.notifications || {
        newApplicationSubmitted: true,
        applicationApprovedRejected: true,
        eventApprovedByAdmin: true,
        eventRejectedByAdmin: true,
        attendanceReminders: true,
        certificateGenerationReminders: true,
        weeklyActivitySummary: true
      },
      certificateSettings: user.organizerProfile?.certificateSettings || { organizerName: "", signature: "", template: "Default", footerText: "" },
      logo: user.organizerProfile?.logo || "",
      stats: {
        eventsCreated,
        applicationsReceived,
        approvedVolunteers,
        certificatesGenerated
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/organizer/settings
// Updates users table (phone) and organizerprofiles table with all custom fields
export const updateOrganizerSettings = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      orgName,
      phone,
      organizationType,
      description,
      university,
      websiteUrl,
      socialMediaLinks,
      members,
      eventPreferences,
      notifications,
      certificateSettings,
      logo
    } = req.body;

    await User.update(
      { phone },
      { where: { id: req.user.id }, transaction }
    );

    await OrganizerProfile.update(
      {
        organizationName: orgName,
        organizationType,
        description,
        university,
        websiteUrl,
        socialMediaLinks,
        members,
        eventPreferences,
        notifications,
        certificateSettings,
        logo
      },
      { where: { userId: req.user.id }, transaction }
    );

    await transaction.commit();
    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: error.message });
  }
};

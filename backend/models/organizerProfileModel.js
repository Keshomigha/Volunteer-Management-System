import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";

const OrganizerProfile = sequelize.define(
  "OrganizerProfile",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
    organizationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    logo: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    organizationType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "IEEE",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    university: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    websiteUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    socialMediaLinks: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { facebook: "", twitter: "", linkedin: "", instagram: "" },
    },
    members: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    eventPreferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { defaultCategory: "", defaultVolunteerLimit: 30, defaultEventLocation: "" },
    },
    notifications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        newApplicationSubmitted: true,
        applicationApprovedRejected: true,
        eventApprovedByAdmin: true,
        eventRejectedByAdmin: true,
        attendanceReminders: true,
        certificateGenerationReminders: true,
        weeklyActivitySummary: true,
      },
    },
    certificateSettings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { organizerName: "", signature: "", template: "Default", footerText: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Associations
User.hasOne(OrganizerProfile, {
  foreignKey: "userId",
  as: "organizerProfile",
  onDelete: "CASCADE",
});
OrganizerProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default OrganizerProfile;

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";

const StudentProfile = sequelize.define(
  "StudentProfile",
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
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        is: /^STU\d{6}$/,
      },
    },
    faculty: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    university: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "State University",
    },
    degreeProgram: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    yearOfStudy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT("long"),
      allowNull: true,
    },
    preferences: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    availability: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: { days: [], times: [] },
    },
    notifications: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        eventRecommendations: true,
        applicationUpdates: true,
        eventReminders: true,
        certificateNotifications: true,
        reputationPointUpdates: true,
      },
    },
    privacy: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {
        showProfileOnLeaderboard: true,
        allowOrganizersToViewSkills: true,
        receivePersonalizedRecommendations: true,
      },
    },
    skills: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
      set(value) {
        if (typeof value === "string") {
          const parsed = value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          this.setDataValue("skills", parsed);
        } else if (Array.isArray(value)) {
          this.setDataValue("skills", value);
        } else {
          this.setDataValue("skills", value || []);
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate studentId if not provided
const generateStudentId = async () => {
  let unique = false;
  let studentId = "";
  while (!unique) {
    const digits = Math.floor(100000 + Math.random() * 900000);
    studentId = `STU${digits}`;
    const existing = await StudentProfile.findOne({ where: { studentId } });
    if (!existing) {
      unique = true;
    }
  }
  return studentId;
};

StudentProfile.beforeValidate(async (profile) => {
  if (!profile.studentId) {
    profile.studentId = await generateStudentId();
  }
});

// Associations
User.hasOne(StudentProfile, {
  foreignKey: "userId",
  as: "studentProfile",
  onDelete: "CASCADE",
});
StudentProfile.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

export default StudentProfile;

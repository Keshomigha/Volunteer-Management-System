import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";

const Event = sequelize.define("Event", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  eventType: {
    type: DataTypes.ENUM("In-Person", "Online"),
    defaultValue: "In-Person",
  },

  meetingLink: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  eventDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },

  volunteerRequired: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  approvalStatus: {
    type: DataTypes.ENUM("Pending", "Approved", "Rejected"),
    defaultValue: "Pending",
  },

  status: {
    type: DataTypes.ENUM("Draft", "Upcoming", "Active", "Completed", "Archived"),
    defaultValue: "Upcoming",
  },

  acceptedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },

  image: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
    defaultValue: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800",
  },
  time: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "10:00 AM",
  },
  reputationPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },

  category: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  skills: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

/*
Relationship
One user → many events
One event → belongs to one user
*/

User.hasMany(Event);

Event.belongsTo(User);

export default Event;
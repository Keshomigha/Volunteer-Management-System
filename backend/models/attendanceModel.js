import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";
import Event from "./eventModel.js";

const Attendance = sequelize.define(
  "Attendance",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // Present = volunteer showed up, Absent = did not show up
    status: {
      type: DataTypes.ENUM("Present", "Absent"),
      defaultValue: "Absent",
    },
    markedBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["UserId", "EventId"],
      },
    ],
  }
);

// One attendance row links one volunteer to one event
Attendance.belongsTo(User, { foreignKey: "UserId", as: "volunteer" });
Attendance.belongsTo(Event, { foreignKey: "EventId", as: "event" });
Attendance.belongsTo(User, { foreignKey: "markedBy", as: "organizer" });

User.hasMany(Attendance, { foreignKey: "UserId" });
Event.hasMany(Attendance, { foreignKey: "EventId" });

export default Attendance;

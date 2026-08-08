import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";

const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    performedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "performedBy",
      references: {
        model: "Users",
        key: "id",
      },
    },
    details: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
  }
);

// AuditLog belongsTo User as performedBy
AuditLog.belongsTo(User, { foreignKey: "performedById", as: "performedBy" });

export default AuditLog;
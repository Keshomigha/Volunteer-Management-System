import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./userModel.js";
import Event from "./eventModel.js";

const Certificate = sequelize.define(
  "Certificate",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    certificateNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    certificateUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // The date printed on the certificate
    issueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    // Volunteer hours shown on the certificate
    hours: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // Which organizer (User.id) issued this certificate
    issuedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
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
        fields: ["userId", "eventId"],
      },
    ],
  }
);

// Auto-generate certificateNumber if not provided
Certificate.beforeValidate(async (cert) => {
  if (!cert.certificateNumber) {
    const { Op } = await import("sequelize");
    const yearStr = String(new Date().getFullYear());
    const prefix = `VH-${yearStr}-`;

    const lastCert = await Certificate.findOne({
      where: {
        certificateNumber: {
          [Op.like]: `${prefix}%`,
        },
      },
      order: [["certificateNumber", "DESC"]],
    });

    let nextNum = 1;
    if (lastCert) {
      const lastNumStr = lastCert.certificateNumber.replace(prefix, "");
      const lastNum = parseInt(lastNumStr, 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    const nextNumStr = String(nextNum).padStart(6, "0");
    cert.certificateNumber = `${prefix}${nextNumStr}`;
  }
});

// A certificate belongs to one volunteer, one event, and one issuer
Certificate.belongsTo(User, { foreignKey: { name: "UserId", field: "userId" }, as: "volunteer", onDelete: "CASCADE" });
Certificate.belongsTo(Event, { foreignKey: { name: "EventId", field: "eventId" }, as: "event", onDelete: "CASCADE" });
Certificate.belongsTo(User, { foreignKey: { name: "issuedBy", field: "issuedBy" }, as: "issuer", onDelete: "CASCADE" });

User.hasMany(Certificate, { foreignKey: { name: "UserId", field: "userId" }, as: "volunteerCertificates", onDelete: "CASCADE" });
User.hasMany(Certificate, { foreignKey: { name: "issuedBy", field: "issuedBy" }, as: "issuedCertificates", onDelete: "CASCADE" });
Event.hasMany(Certificate, { foreignKey: { name: "EventId", field: "eventId" }, as: "certificates", onDelete: "CASCADE" });

export default Certificate;

import { DataTypes } from "sequelize";

import sequelize from "../config/database.js";

const SystemSetting =
sequelize.define(
"SystemSetting",
{

siteName: {
  type: DataTypes.STRING,
  defaultValue: "VolunteerHub",
},

adminEmail: {
  type: DataTypes.STRING,
  defaultValue: "admin@gmail.com",
},

maxEventsPerClub: {
  type: DataTypes.INTEGER,
  defaultValue: 10,
},

eventApprovalRequired: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},

notificationsEnabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},

darkModeEnabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},

registrationOpen: {
  type: DataTypes.BOOLEAN,
  defaultValue: true,
},

maintenanceMode: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},

}

);

export default SystemSetting;
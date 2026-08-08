import SystemSetting from "../models/systemSetting.js";

export const getSettings = async () => {
  let settings = await SystemSetting.findByPk(1);
  if (!settings) {
    settings = await SystemSetting.create({ id: 1 });
  }
  return settings;
};

export const updateSettings = async (data) => {
  let settings = await SystemSetting.findByPk(1);
  if (!settings) {
    settings = await SystemSetting.create({ id: 1 });
  }
  await settings.update(data);
  return settings;
};

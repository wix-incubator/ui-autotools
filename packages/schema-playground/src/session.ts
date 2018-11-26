const getFileKey = (filePath: string): string =>
  'schema-playground-file: ' + filePath;

const getSettingKey = (settingName: string): string =>
  'schema-playground-setting: ' + settingName;

export const loadSetting = (name: string): string | null =>
  window.sessionStorage.getItem(getSettingKey(name));

export const saveSetting = (name: string, value: string): void =>
  window.sessionStorage.setItem(getSettingKey(name), value);

export const loadFile = (filePath: string): string | null =>
  window.sessionStorage.getItem(getFileKey(filePath));

export const saveFile = (filePath: string, content: string): void =>
  window.sessionStorage.setItem(getFileKey(filePath), content);

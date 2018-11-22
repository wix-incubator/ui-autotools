interface IUserConfig {
  setup?: () => void;
  initializeRequireHooks?: boolean;
}

const defaultUserConfig: IUserConfig = {
  initializeRequireHooks: true
};

export function getUserConfig(configPath: string): IUserConfig {
  let userConfig: IUserConfig = {};

  try {
    userConfig = require(configPath) as IUserConfig;
  } catch (e) {
    // fallthrough
  }

  return {
    ...defaultUserConfig,
    ...userConfig
  };
}

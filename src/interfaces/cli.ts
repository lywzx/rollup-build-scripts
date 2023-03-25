export interface ICliBuildDirectory {
  /**
   * assign workspaces
   */
  workspace?: string[];
}

export interface ICliBuild {
  /**
   * config file directory
   */
  config?: string;

  /**
   * Enable TypeScript for building the code
   */
  enableTypescript?: boolean;
}

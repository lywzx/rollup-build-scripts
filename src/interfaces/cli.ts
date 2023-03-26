export interface ICliBuildDirectory {
  /**
   * assign workspaces
   */
  workspace?: string[];
  /**
   * library output directory
   */
  outputPrefix: string;
}

export interface ICliBuild {
  /**
   * config file directory
   * e.g .rollup.
   */
  config?: string;
  /**
   * Enable TypeScript for building the code
   */
  enableTypescript?: boolean;
  /**
   * enable typescript declaration merging
   */
  enableDts?: boolean;
  /**
   * enable import json file
   */
  enableJsonPlugin?: boolean;
  /**
   * enable build script support browser
   */
  enableBrowser?: boolean;
  /**
   * tsconfig file location
   */
  tsconfig?: string;
  /**
   * specify the entry file for the build
   * @default ['index.ts']
   */
  input?: string[];
  /**
   * specify the path prefix for the entry file
   */
  inputPrefix?: string;
  /**
   * generate sourcemap file
   */
  enableSourcemap?: boolean;
  /**
   * when build script, put text to build library
   */
  bannerText?: string;
  /**
   * external package not include in bundle
   */
  external?: string[];
  /**
   * when workspace mode, all package as external each other.
   */
  externalEachOther?: boolean;
  /**
   * when build end, copy file to dist directory
   */
  copy?: string[];
  /**
   * bundle format
   */
  bf?: Array<'es' | 'umd' | 'cjs'>;
  /**
   * need compress file
   */
  minify?: boolean;
}

export interface ICliEnterFilter {
  /**
   * only build these packages
   */
  onlyEntry?: string[];
  /**
   * all package exclude these packages will build
   */
  excludeEntry?: string[];
}

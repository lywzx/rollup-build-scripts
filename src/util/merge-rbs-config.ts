import { ICliBuild, ICliBuildDirectory, ICliEnterFilter, RbsConfig } from '../interfaces';
import { guessRbsConfigPath, guessRbsRootPackageJson } from './guess-args';
import { dirname, join, sep } from 'path';
import { readFile } from './fs';
import { isFile } from './dir';
import { castArray } from './helper';

export type CleanOption = ICliBuildDirectory &
  ICliEnterFilter & {
    /**
     * 顶层路径目录
     */
    rootPath: string;
  };

/**
 * require rollup config file
 * @param currentPath
 */
export async function guessRbsConfigFromConfigFile(currentPath: string): Promise<CleanOption> {
  const rollupConfigFile = await guessRbsConfigPath(undefined, currentPath);
  const result: CleanOption = {
    rootPath: '',
    outputPrefix: 'dist',
  };
  if (rollupConfigFile) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const content = require(rollupConfigFile);
    result.rootPath = dirname(rollupConfigFile);
    (
      [
        'workspace',
        'outputPrefix',
        'outputRootPath',
        'outputLibraryPath',
        'directoryDepth',
        'onlyPackage',
        'excludePackage',
      ] as Array<keyof CleanOption>
    ).forEach((key) => {
      if (typeof content[key] !== 'undefined') {
        (result[key] as unknown) = content[key];
      }
    });
  }

  if (!rollupConfigFile) {
    const rootPackage = await guessRbsRootPackageJson(currentPath);
    if (rootPackage) {
      const content = JSON.parse(await readFile(rootPackage, { encoding: 'utf-8' }));
      result.rootPath = dirname(rootPackage);
      if (typeof content.workspace !== 'undefined') {
        result.workspace = content.workspace;
      }
    }
  }

  // 如果非workspace模式，则表明在某个目录之中
  if (result.workspace && currentPath !== result.rootPath && (await isFile(join(currentPath, 'package.json')))) {
    if (
      castArray(result.workspace).some((workspace) => {
        return new RegExp(`${join(result.rootPath, workspace)}${sep}(?:.*)`).test(currentPath);
      })
    ) {
      const currentPackage = await readFile(join(currentPath, 'package.json'), { encoding: 'utf-8' });
      const packageContent = JSON.parse(currentPackage);
      result.onlyPackage = [packageContent.name];
    }
  }

  return result;
}

/**
 * guess rbs directory
 * @param option
 */
export async function guessRbsBuildDirectoryConfig(option: CleanOption): Promise<CleanOption> {
  // 默认配置信息
  const config = await guessRbsConfigFromConfigFile(option.rootPath);

  (
    [
      'workspace',
      'outputPrefix',
      'outputRootPath',
      'outputLibraryPath',
      'directoryDepth',
      'onlyPackage',
      'excludePackage',
    ] as Array<keyof CleanOption>
  ).forEach((key) => {
    if (typeof option[key] !== 'undefined') {
      (config[key] as unknown) = option[key];
    }
  });

  return config;
}

export type BuildPureOption = ICliBuild & {
  /**
   * root directory
   */
  rootPath: string;
};

/**
 * build option
 */
export type BuildOption = BuildPureOption & ICliEnterFilter & ICliBuildDirectory;

/**
 * build args config
 * @param option
 */
export async function guessRbsBuildPureOptionConfig(option: BuildPureOption): Promise<RbsConfig> {
  const configFilePath = await guessRbsConfigPath(undefined, option.rootPath, 1);

  const result: RbsConfig = {
    ...option,
  } as any;

  const keys: Array<keyof RbsConfig> = [
    'enableTypescript',
    'enableDts',
    'tsconfig',
    'tsconfigOverride',
    'enableJsonPlugin',
    'input',
    'inputPrefix',
    'bannerText',
    'enableSourcemap',
    'enableBrowser',
    'buble',
    'commonjs',
    'replace',
    'extensions',
    'externalEachOther',
    'external',
    'outputGlobals',
    'onlyEntry',
    'handleCopyPackageJson',
    'handleConfig',
  ];

  let configFileContent: RbsConfig = {};
  if (configFilePath) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    configFileContent = require(configFilePath) as RbsConfig;
  }

  keys.forEach((key) => {
    if (key in option && typeof (option as unknown as any)[key] !== 'undefined') {
      (result[key] as unknown) = (option as unknown as any)[key];
    } else if (key in configFileContent && typeof (configFileContent as unknown as any)[key] !== 'undefined') {
      (result[key] as unknown) = configFileContent[key];
    }
  });

  // guess logic
  if (!('enableTypescript' in result)) {
    if (result.input) {
      result.enableTypescript = castArray(result.input).some((file) => /([\S ]+).tsx?$/);
    }
  }

  return result;
}

export type RbsConfigWithPath = RbsConfig & { rootPath: string };

/**
 * guess build option
 * @param option
 */
export async function guessRbsBuildOptionConfig(option: BuildOption): Promise<RbsConfigWithPath> {
  const directoryOption = await guessRbsBuildDirectoryConfig(option);
  const buildOption = await guessRbsBuildPureOptionConfig({
    ...option,
    rootPath: directoryOption.rootPath,
  });

  return {
    ...option,
    ...buildOption,
    ...directoryOption,
  } as unknown as RbsConfigWithPath;
}

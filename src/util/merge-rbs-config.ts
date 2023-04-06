import { ICliBuild, ICliBuildDirectory, ICliEnterFilter, RbsConfig } from '../interfaces';
import { guessRbsConfigPath, guessRbsRootPackageJson } from './guess-args';
import { dirname, join, sep } from 'path';
import { readFile } from './fs';
import { isFile } from './dir';

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
      result.workspace.some((workspace) => {
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
export async function guessRbsBuildPureOptionConfig(option: BuildPureOption): Promise<ICliBuild> {
  const configFilePath = await guessRbsConfigPath(undefined, option.rootPath, 1);

  const result: BuildPureOption = {
    extension: [],
    rootPath: option.rootPath,
  };

  if (configFilePath) {
    const content: RbsConfig = require(configFilePath);

    ([
      'enableTypescript',
      'extensions',
      'external',
      'externalEachOther',
    ] as Array<keyof RbsConfig>).forEach((key) => {
      (result[key as keyof BuildPureOption] as unknown) = content[key];
    });
  }

  return result;
}

/**
 * guess build option
 * @param option
 */
export async function guessRbsBuildOptionConfig(option: BuildOption): Promise<RbsConfig> {
  const directoryOption = await guessRbsBuildDirectoryConfig(option);
  const buildOption = await guessRbsBuildPureOptionConfig({
    ...option,
    rootPath: directoryOption.rootPath,
  });

  return {
    ...option,
    ...buildOption,
    ...directoryOption,
  };
}

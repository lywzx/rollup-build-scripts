import { ICliBuildDirectory, ICliEnterFilter } from '../interfaces';
import { guessRbsConfigPath, guessRbsRootPackageJson } from './guess-args';
import { dirname } from 'path';
import { readFile } from './fs';

export type CleanOption = ICliBuildDirectory &
  ICliEnterFilter & {
    /**
     * 顶层路径目录
     */
    rootPath: string;
  };

/**
 * require rollup config file
 * @param rootPath
 */
export async function guessRbsConfigFromConfigFile(rootPath: string): Promise<CleanOption> {
  const rollupConfigFile = await guessRbsConfigPath(undefined, rootPath);
  const result: CleanOption = {
    rootPath: '',
    outputPrefix: 'dist',
  };
  if (rollupConfigFile) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const content = require(rollupConfigFile).default;
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
    const rootPackage = await guessRbsRootPackageJson(rootPath);
    if (rootPackage) {
      const content = JSON.parse(await readFile(rootPackage, { encoding: 'utf-8' }));
      result.rootPath = dirname(rootPackage);
      if (typeof content.workspace !== 'undefined') {
        result.workspace = content.workspace;
      }
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

  return option;
}

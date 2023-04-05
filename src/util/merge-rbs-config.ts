import { ICliBuildDirectory, ICliEnterFilter } from '../interfaces';
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
      result.workspace.some((workspace) => {
        return new RegExp(`${join(result.rootPath, workspace)}${sep}(?:.*)`).test(currentPath);
      })
    ) {
      const currentPackage = await readFile(join(currentPath, 'package.json'), { encoding: 'utf-8' });
      const packageContent = JSON.parse(currentPackage);
      result.onlyPackage = result.onlyPackage
        ? castArray(result.onlyPackage).concat(packageContent.name)
        : [packageContent.name];
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

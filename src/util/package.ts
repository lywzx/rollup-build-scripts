import { ICliEnterFilter, IPackageConfig } from '../interfaces';
import castArray from 'lodash/castArray';
import { isFile } from './dir';
import { join } from 'path';
import { readFile, readdir, stat } from './fs';
import { RollupOptions } from 'rollup';
import { RbsConfigWithPath } from './merge-rbs-config';
import { PACKAGE_ENTRY } from '../constant/constant';

/**
 *
 * @param workspaces
 * @param maxLevel
 * @param excludeDirectory
 */
export async function scanWorkspacePackages(
  workspaces: string[] | string,
  { maxLevel = 3, excludeDirectories = ['node_modules'], rootPath = process.cwd() } = {}
): Promise<IPackageConfig[]> {
  const stacks = castArray(workspaces).map((workspace) => {
    return {
      workspace,
      dir: '',
      level: 0,
    };
  });

  const result: IPackageConfig[] = [];
  let stack: (typeof stacks)[0] | undefined;
  while (!!(stack = stacks.pop())) {
    const fullPath = join(rootPath, stack.workspace, stack.dir);
    const packageJsonFilePath = join(fullPath, 'package.json');
    if (await isFile(packageJsonFilePath)) {
      const fileContent = JSON.parse(await readFile(packageJsonFilePath, { encoding: 'utf-8' }));
      result.push({
        workspace: stack.workspace,
        dir: stack.dir,
        fullPath,
        packageName: fileContent.name,
        packageConfig: fileContent,
      });
      continue;
    }
    if (stack.level > maxLevel) {
      continue;
    }
    const dirContent = await readdir(fullPath);
    const directories = (
      await Promise.all(
        dirContent.map(async (i) => {
          const filePath = join(fullPath, i);
          const content = await stat(filePath);
          if (content.isDirectory()) {
            return i;
          }
          return false;
        })
      )
    )
      .filter((i): i is string => !!i)
      .filter((i) => !excludeDirectories.includes(i));
    stacks.push(
      ...directories.map((dir) => {
        return {
          workspace: stack!.workspace,
          dir: join(stack!.dir, dir),
          level: stack!.level + 1,
        };
      })
    );
  }

  return result;
}

/**
 * filter exists package
 * @param packages
 * @param filter
 */
export function filteredPackages(packages: IPackageConfig[], filter: ICliEnterFilter) {
  const { onlyPackage = [], excludePackage = [] } = filter;

  const onlyRegExp = onlyPackage.map((i) => new RegExp(i));
  const excludeRegExp = excludePackage.map((i) => new RegExp(i));

  return packages.filter((pkg) => {
    if (excludeRegExp.some((reg) => reg.test(pkg.packageName))) {
      return false;
    }
    if (onlyRegExp.length && !onlyRegExp.some((reg) => reg.test(pkg.packageName))) {
      return false;
    }
    return true;
  });
}

/**
 *
 * @param packageInfo
 * @param config
 */
export async function transformPackageConfigToRollupConfig(
  packageInfo: IPackageConfig,
  config: RbsConfigWithPath
): Promise<RollupOptions[]> {
  const result: RollupOptions[] = [];

  //
  const option: RollupOptions = {
    input: [],
    plugins: [],
    external: [],
  };

  // 处理input输入内容

  option.input = (
    await Promise.all(
      castArray(config.input || PACKAGE_ENTRY).map(async (file) => {
        const isFileExists = await isFile(join(packageInfo.fullPath, config.inputPrefix || '', file));
        if (isFileExists) {
          return file;
        }
        return undefined;
      })
    )
  ).filter((i): i is string => {
    return !!i;
  });


  result.push(option);

  // 处理
  return result;
}

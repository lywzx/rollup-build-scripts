import { ICliEnterFilter, IPackageConfig } from '../interfaces';
import castArray from 'lodash/castArray';
import { isFile } from './dir';
import { join } from 'path';
import { readFile, readdir, stat } from './fs';

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

import { on } from 'cluster';
import { readdirSync } from 'fs';
import { join } from 'path';
import { IPackageConfig } from '../interfaces/package-option';
import { isFile } from './dir';
import { readFileSync } from 'fs';
import { flatten } from 'lodash';

/**
 * 获取所有的包内容
 */
export function getAllPackages(workspace?: string): IPackageConfig[] {
  if (workspace) {
    return flatten(workspace.split(',').map((w: string) => {
      return readdirSync(w).map(dir => {
        const newPath = join(w, dir, 'package.json');
        if (isFile(newPath)) {
          return {
            workspace: w,
            dir,
          };
        }
        return false;
      }).filter((it): it is {workspace: string; dir: string} => !!it).map((it):IPackageConfig  => {
        const fullPath = join(it.workspace, it.dir);
        return {
          ...it,
          fullPath,
          packageConfig: JSON.parse(readFileSync(join(fullPath, it.dir, 'package.json'), {
            encoding: 'utf-8',
          }) as string)
        }
      });
    }));
  }
  if (isFile('package.json')) {
    return [
      {
        workspace: '',
        dir: '',
        fullPath: '',
        packageConfig: JSON.parse(readFileSync('package.json', {encoding: 'utf-8'}))
      }
    ]
  }
  throw new Error("can not find pacakge.json");
}

/**
 * 从所有的packages中匹配出符合only字段的package
 * @param packages
 * @param only
 */
export function filterOnlyPackages(packages: IPackageConfig[], only?: string): IPackageConfig[] {
  if (typeof only === 'undefined') {
    return packages;
  }
  const onlyPackages = only.split(',');
  return packages.filter((pkg) => {
    return onlyPackages.includes(pkg.packageConfig.name);
  });
}

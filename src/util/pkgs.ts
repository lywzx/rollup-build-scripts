import { readdirSync } from 'fs';
import { join } from 'path';
import { IPackageConfig, IRollupConfig } from '../interfaces/package-option';
import { isFile } from './dir';
import { readFileSync } from 'fs';
import { flatten, isFunction } from 'lodash';
import { entries } from '../constant';
import { generateRollupConfig } from './build';

/**
 * 获取所有的包内容
 */
export function getAllPackages(options: IRollupConfig): IPackageConfig[] {
  if (options.workspace) {
    return flatten(
      options.workspace.map((w: string) => {
        return readdirSync(w)
          .map((dir) => {
            const newPath = join(w, dir, 'package.json');
            if (isFile(newPath)) {
              return {
                workspace: w,
                dir,
              };
            }
            return false;
          })
          .filter((it): it is { workspace: string; dir: string } => !!it)
          .map(
            (it): IPackageConfig => {
              const fullPath = join(it.workspace, it.dir);
              return {
                ...it,
                fullPath,
                packageConfig: JSON.parse(
                  readFileSync(join(fullPath, 'package.json'), {
                    encoding: 'utf-8',
                  }) as string
                ),
              };
            }
          );
      })
    );
  }
  if (isFile('package.json')) {
    return [
      {
        workspace: '',
        dir: '',
        fullPath: '',
        packageConfig: JSON.parse(readFileSync('package.json', { encoding: 'utf-8' })),
      },
    ];
  }
  throw new Error('can not find pacakge.json');
}

/**
 * 匹配出限制之后的所有package
 * @param options
 * @param config
 */
export function getAllowPackages(options: IPackageConfig[], config: IRollupConfig): IPackageConfig[] {
  return options.filter((it) => {
    if (config.onlyPackage) {
      return config.onlyPackage.includes(it.packageConfig.name);
    }
    return true;
  });
}

/**
 * 根据包名，及所有配置，生成包的内容
 * @param packages
 * @param option
 */
export function getAllPackagesEntry(packages: IPackageConfig[], option: IRollupConfig) {
  return flatten(
    getAllowPackages(packages, option).map((pkg) => {
      return entries
        .filter((it) => {
          return isFunction(option.onlyEntry) && option.onlyEntry(it, pkg);
        })
        .map((entry, index) => {
          return generateRollupConfig(pkg, entry, option, packages, true);
        });
    })
  );
}

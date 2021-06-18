import del from 'del';
import { readdirSync } from 'fs';
import { join } from 'path';
import { IPackageConfig, IRollupConfig, IEntryOption } from '../interfaces';
import { isFile } from './dir';
import { readFileSync } from 'fs';
import { flatten, isFunction, isString, groupBy, find, mapValues, sortBy, last, pickBy } from 'lodash';
import { entries } from '../constant';
import { generateOutputPackagePath, generateRollupConfig, generateRollupDtsConfig } from './rollup-util';

/**
 * 获取所有的包内容
 */
export function getAllPackages(options: IRollupConfig): IPackageConfig[] {
  if (options.workspace && options.workspace.length) {
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
          .map((it): IPackageConfig => {
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
          });
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
  return options.filter((pkg) => {
    if (config.onlyPackage) {
      return config.onlyPackage.some((it) => {
        if (typeof it === 'string') {
          return it === pkg.packageConfig.name;
        }
        return it.test(pkg.packageConfig.name);
      });
    }
    return true;
  });
}

/**
 * 获取所有构建后的entries
 * @param pkg
 * @param entry
 * @param option
 */
export function packageOnlyEntryFilter(pkg: IPackageConfig, entry: IEntryOption, option: IRollupConfig) {
  return isFunction(option.onlyEntry) && option.onlyEntry(entry, pkg);
}

/**
 * 根据包名，及所有配置，生成包的内容
 * @param packages
 * @param option
 */
export function getAllPackagesRollupEntry(packages: IPackageConfig[], option: IRollupConfig) {
  return flatten(
    getAllowPackages(packages, option).map((pkg) => {
      const availableEntries = entries(option.ts).filter((it) => {
        return packageOnlyEntryFilter(pkg, it, option);
      });
    console.log('aaaaaaaa', availableEntries);
      // 构建代码的entry
      const buildEntry = availableEntries.map((entry, index) => {
        return generateRollupConfig(pkg, entry, option, {
          packages,
          entries: availableEntries,
          isFirst: index === 0,
          isLast: index === availableEntries.length - 1,
          index,
        });
      });

      // dts入口
      const dtsEntry = generateRollupDtsConfig(pkg, availableEntries, option);

      return [...buildEntry, ...dtsEntry];
    })
  );
}

/**
 * 生成包当中的entry
 * @param entries
 */
export function generatePackageEntries(entries: IEntryOption[]): Record<string, string> {
  const groupByEntries = mapValues(groupBy(entries, 'format'), (values) => {
    return sortBy(values, (v) => {
      return (
        {
          production: 1,
          development: 0,
        }[v.env] ?? 2
      );
    });
  });
  let main: string | undefined,
    module: string | undefined,
    unpkg: string | undefined,
    jsdelivr: string | undefined,
    browser: string | undefined;
  if (groupByEntries.cjs) {
    main = groupByEntries.cjs[0].file;
  }
  if (groupByEntries.es) {
    const el = find(groupByEntries.es, (it) => !it.browser);
    module = el?.file;
  }
  if (groupByEntries.es) {
    const el = find(groupByEntries.es, (it) => !!it.browser);
    browser = el?.file;
  }
  if (groupByEntries.umd) {
    unpkg = last(groupByEntries.umd)?.file;
    jsdelivr = last(groupByEntries.umd)?.file;
  }

  if (!main) {
    main = find([module, browser, unpkg], (it) => !!it);
  }

  return pickBy(
    {
      main,
      module,
      browser,
      jsdelivr,
      unpkg,
    },
    isString
  );
}

/**
 * 清空包当中dts文件
 * @param packages
 * @param option
 */
export async function clearPackageOutPackageDts(packages: IPackageConfig[], option: IRollupConfig) {
  const outputPackageJson = packages.map((pkg) => {
    const pkgPath = generateOutputPackagePath('package.json', pkg, option);
    const pkgContent = JSON.parse(
      readFileSync(pkgPath, {
        encoding: 'utf-8',
      }) as string
    );
    if (pkgContent.types) {
      const d = [
        join(process.cwd(), generateOutputPackagePath('**/*.d.ts', pkg, option)),
        `!${join(process.cwd(), generateOutputPackagePath(pkgContent.types, pkg, option))}`,
      ];
      return del(d);
    }
    return null;
  });

  return Promise.all(outputPackageJson);
}

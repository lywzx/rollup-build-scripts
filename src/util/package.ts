import { ICliEnterFilter, IPackageConfig } from '../interfaces';
import castArray from 'lodash/castArray';
import { isFile } from './dir';
import { join } from 'path';
import { readFile, readdir, stat } from './fs';
import { ExternalOption, GlobalsOption, OutputOptions, RollupOptions } from 'rollup';
import { RbsConfigWithPath } from './merge-rbs-config';
import { PACKAGE_ENTRY } from '../constant/constant';
import { camelCase, isArray, isFunction, isObject, isRegExp, isString, last, template } from 'lodash';
import lazy from 'import-lazy';

const importLazy = lazy(require);

const rollupTypescript = importLazy('rollup-plugin-typescript2');
const json = importLazy('@rollup/plugin-json');
const buble = importLazy('@rollup/plugin-buble');
const resolve = importLazy('@rollup/plugin-node-resolve');
const commonjs = importLazy('@rollup/plugin-commonjs');
const terser = importLazy('rollup-plugin-terser');
const replace = importLazy('@rollup/plugin-replace');
const copy = importLazy('rollup-plugin-copy');
const dtsPlugin = importLazy('rollup-plugin-dts');

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
 * @param allPackageInfos
 */
export async function transformPackageConfigToRollupConfig(
  packageInfo: IPackageConfig,
  config: RbsConfigWithPath,
  allPackageInfos: IPackageConfig[]
): Promise<RollupOptions[]> {
  const result: RollupOptions[] = [];

  //
  const option: RollupOptions = {
    input: [],
    plugins: [],
    external: [],
    output: [],
  };

  // 处理input输入内容
  option.input = (
    await Promise.all(
      castArray(config.input || PACKAGE_ENTRY).map(async (file) => {
        const isFileExists = await isFile(join(packageInfo.fullPath, config.inputPrefix || '', file));
        if (isFileExists) {
          return join(config.inputPrefix || '', file);
        }
        return undefined;
      })
    )
  ).filter((i): i is string => {
    return !!i;
  });

  // 处理external
  if (config.external) {
    if (
      isObject(config.external) &&
      (config.external as Record<string, ExternalOption>)[packageInfo.packageName as string]
    ) {
      config.external = (config.external as Record<string, ExternalOption>)[packageInfo.packageName];
    } else if (
      isString(config.external) ||
      isRegExp(config.external) ||
      isArray(config.external) ||
      isFunction(config.external)
    ) {
      option.external = config.external;
    }
  }

  if (config.externalEachOther && (!config.external || isArray(config.external))) {
    config.external = [
      ...(config.external || []),
      ...allPackageInfos.map((it) => it.packageName).filter((it) => it !== packageInfo.packageName),
    ];
  }

  if (config.outputGlobals) {
    (option.output as OutputOptions).globals =
      (config.outputGlobals as Record<string, GlobalsOption>)[packageInfo.packageName] ?? config.outputGlobals;
  }

  if (config.buildFormat)
    if (config.enableTypescript) {
      /*if (entry.format === 'umd') {
      (option.output as OutputOptions).name = camelCase(last(packageInfo.packageName.split('/')));
    }*/

      (option.plugins as Array<any>).push(
        rollupTypescript({
          tsconfig: join(packageInfo.fullPath, config.tsconfig ?? 'tsconfig.json'),
          tsconfigOverride: {
            ...(config.tsconfigOverride ?? {}),
          },
        })
      );
    }
  if (config.enableJsonPlugin) {
    (option.plugins as Array<any>).push(json());
  }

  if (config.buble) {
    (option.plugins as Array<any>).push(buble(option.buble));
  }

  if (config.enableJsonPlugin || config.extensions) {
    (option.plugins as Array<any>).push(
      resolve.nodeResolve({
        preferBuiltins: false,
        extends: config.extensions ?? ['.ts', '.tsx', '.js', '.mjs'],
      })
    );
  }

  if (config.replace) {
    // (option.plugins as Array<any>).push(replace(isFunction(config.replace) ? config.replace(entry, pkg) : option.replace));
  }

  if (config.enableJsonPlugin || config.commonjs) {
    (option.plugins as Array<any>).push(
      commonjs({
        transformMixedEsModules: true,
        extensions: ['.ts', '.tsx', '.js'],
        ...(config.commonjs ?? {}),
      })
    );
  }

  if (entry.minify) {
    config.plugins?.push(
      terser.terser({
        module: entry.format === 'es',
      })
    );
  }

  /*if (isLast) {
    const copyOptions: any[] = [
      {
        src: join(pkg.fullPath, 'package.json'),
        dest: generateOutputPackagePath('', pkg, option),
        transform: (contents: string, filename: string) => {
          const pkgConfig = JSON.parse(contents.toString());
          const override = mapValues(generatePackageEntries(entries), (p) => {
            return join(option.outLibrary!, p);
          });
          if (option.ts) {
            const umd = entries.find((it) => it.format === 'umd' && it.env === 'development');
            if (umd) {
              override.types = join(option.outLibrary!, umd.file).replace('.js', '.d.ts');
            }
          }

          return JSON.stringify(
            option.handleCopyPackageJson!({
              ...pkgConfig,
              ...override,
            }),
            null,
            2
          );
        },
      },
    ];
    const readMe = ['README.md', 'readme.md'].find((f) => isFile(join(pkg.fullPath, f)));
    if (readMe) {
      copyOptions.push({
        src: join(pkg.fullPath, readMe),
        dest: generateOutputPackagePath('', pkg, option),
      });
    }
    config.plugins?.push(
      copy({
        targets: copyOptions,
      })
    );
  }*/

  /*if (option.handleConfig) {
    return option.handleConfig(config, pkg);
  }*/

  result.push(option);

  // 处理
  return result;
}

import { join } from 'path';
import { ExternalOption, GlobalsOption, OutputOptions, RollupOptions } from 'rollup';
import { camelCase, isFunction, template, last, isObject, isArray, isString, isRegExp, mapValues, merge } from 'lodash';
import lazy from 'import-lazy';
import { IPackageConfig, IRollupConfig, IRollupConfigEntryFilter, IEntryOption } from '../interfaces';
import { isFile } from './dir';
import { generatePackageEntries } from './packages-util';

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
 * 判断当前输入是否为rollup entry filter
 * @param config
 */
export function isIRollupConfigEntryFilter(config: any): config is IRollupConfigEntryFilter {
  if (typeof config === 'object' && ('browser' in config || 'format' in config)) {
    return true;
  }
  return false;
}

/**
 * 生成文件输出文件路径
 * @param file
 * @param pkg
 * @param option
 */
export function generateOutputFilePath(file: string, pkg: IPackageConfig, option: IRollupConfig) {
  if (option.outRootPath) {
    return join(option.outRootPath, pkg.packageConfig.name, option.outLibrary!, file);
  }
  return join(pkg.fullPath, option.outPrefix!, option.outLibrary!, file);
}

/**
 * 生成package.json文件目录
 * @param file
 * @param pkg
 * @param option
 */
export function generateOutputPackagePath(file: string, pkg: IPackageConfig, option: IRollupConfig) {
  if (option.outRootPath) {
    return join(option.outRootPath, pkg.packageConfig.name, file);
  }
  return join(pkg.fullPath, option.outPrefix!, file);
}

/**
 * 生成rollup的配置
 * @param pkg
 * @param entry
 * @param option
 * @param allConfig
 */
export function generateRollupConfig(
  pkg: IPackageConfig,
  entry: IEntryOption,
  option: IRollupConfig,
  allConfig: {
    packages: IPackageConfig[];
    entries: IEntryOption[];
    isFirst: boolean;
    isLast: boolean;
    index: number;
  }
): RollupOptions {
  const { isLast, packages, entries } = allConfig;

  const config: RollupOptions = {
    input: join(pkg.fullPath, option.inputPrefix ?? '', option.input ?? entry.input),
    plugins: [],
    output: {
      banner: template(option.banner)({
        package: pkg.packageConfig,
      }),
      file: generateOutputFilePath(entry.file, pkg, option),
      format: entry.format,
      globals: {},
      sourcemap: option.sourcemap,
    },
  };

  // 处理external
  if (option.external) {
    if (
      isObject(option.external) &&
      (option.external as Record<string, ExternalOption>)[pkg.packageConfig.name as string]
    ) {
      config.external = (option.external as Record<string, ExternalOption>)[pkg.packageConfig.name];
    } else if (
      isString(option.external) ||
      isRegExp(option.external) ||
      isArray(option.external) ||
      isFunction(option.external)
    ) {
      config.external = option.external;
    }
  }

  if (option.outputGlobals) {
    (config.output as OutputOptions).globals =
      (option.outputGlobals as Record<string, GlobalsOption>)[pkg.packageConfig.name as string] ?? option.outputGlobals;
  }

  if (option.externalEachOther && (!config.external || isArray(config.external))) {
    config.external = [
      ...(config.external || []),
      ...packages.map((it) => it.packageConfig.name as string).filter((it) => it !== pkg.packageConfig.name),
    ];
  }

  if (entry.format === 'umd') {
    (config.output as OutputOptions).name = camelCase(last(pkg.packageConfig.name.split('/')));
  }

  if (option.ts) {
    config.plugins?.push(
      rollupTypescript({
        tsconfig: join(pkg.fullPath, option.tsconfig ?? 'tsconfig.json'),
        tsconfigOverride: {
          ...(option.tsconfigOverride ?? {}),
        },
      })
    );
  }
  if (option.json) {
    config.plugins?.push(json());
  }

  if (option.buble) {
    config.plugins?.push(buble(option.buble));
  }

  if (option.ts || option.extensions) {
    config.plugins?.push(
      resolve.nodeResolve({
        preferBuiltins: false,
        extends: option.extensions ?? ['.ts', '.tsx', '.js', '.mjs'],
      })
    );
  }

  if (option.replace) {
    config.plugins?.push(replace(isFunction(option.replace) ? option.replace(entry, pkg) : option.replace));
  }

  if (option.ts || option.commonjs) {
    config.plugins?.push(
      commonjs({
        transformMixedEsModules: true,
        extensions: ['.ts', '.tsx', '.js'],
        ...(option.commonjs ?? {}),
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

  if (isLast) {
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
  }

  if (option.handleConfig) {
    return option.handleConfig(config, pkg);
  }

  return config;
}

/**
 * 生成rollup-dts的配置
 * @param pkg
 * @param entries
 * @param option
 */
export function generateRollupDtsConfig(pkg: IPackageConfig, entries: IEntryOption[], option: IRollupConfig) {
  const { dts } = option;
  if (!option.watch && dts && entries.length) {
    const first = entries[0];
    return [
      {
        input: generateOutputFilePath(first.input.replace('.ts', '.d.ts'), pkg, option),
        output: [
          {
            file: generateOutputFilePath(first.input.replace('.ts', '.d.ts'), pkg, option),
            format: 'es',
          },
        ],
        plugins: [dtsPlugin.default()],
      },
    ];
  }
  return [];
}

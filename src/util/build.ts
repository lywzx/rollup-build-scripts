import { join } from 'path';
import { readFileSync } from 'fs';
import { gzipSync } from 'zlib';
import { compress } from 'brotli';
import { gray, bold } from 'chalk';
import { ExternalOption, OutputOptions, RollupOptions } from 'rollup';
import { camelCase, isFunction, template, last, isObject, isArray, isString, isRegExp } from 'lodash';
import lazy from 'import-lazy';
import { IPackageConfig, IRollupConfig, IRollupConfigEntryFilter } from '../interfaces/package-option';
import { IEntryOption } from '../interfaces/entry-option';

const importLazy = lazy(require);
const rollupTypescript = importLazy('rollup-plugin-typescript2');
const json = importLazy('@rollup/plugin-json');
const buble = importLazy('@rollup/plugin-buble');
const resolve = importLazy('@rollup/plugin-node-resolve');
const commonjs = importLazy('@rollup/plugin-commonjs');
const terser = importLazy('rollup-plugin-terser');
const replace = importLazy('@rollup/plugin-replace');
const copy = importLazy('rollup-plugin-copy');

/**
 * check file size
 * @param file
 */
export function checkSize(file: string) {
  const f = readFileSync(file);
  const minSize = (f.length / 1024).toFixed(2) + 'kb';
  const gzipped = gzipSync(f);
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';
  const compressed = compress(f);
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
  console.log(`${gray(bold(file))} size:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`);
}

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
 * 判断当明入口是否被显示
 * @param input
 * @param pkg
 * @param config
 */
export function filterEntryByRollupConfigEntryFilter(
  input: IEntryOption,
  pkg: IPackageConfig,
  config: IRollupConfigEntryFilter
) {
  if ('browser' in config) {
    if (input.browser !== config.browser) {
      return false;
    }
  }
  if (config.format) {
    return config.format.includes(input.format);
  }
  return true;
}

/**
 * 生成rollup的配置
 * @param pkg
 * @param entry
 * @param option
 * @param packages
 */
export function generateRollupConfig(
  pkg: IPackageConfig,
  entry: IEntryOption,
  option: IRollupConfig,
  packages: IPackageConfig[],
  // 是否是某个包首次构建
  init: boolean
): RollupOptions {
  const config: RollupOptions = {
    input: join(pkg.fullPath, option.inputPrefix ?? '', option.input ?? entry.input),
    plugins: [],
    output: {
      banner: template(option.banner)({
        package: pkg.packageConfig,
      }),
      file: join(pkg.fullPath, option.outRootPath ?? '', option.outPrefix ?? '', entry.file),
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

  if (init) {
    config.plugins?.push(
      copy({
        targets: [
          {
            src: join(pkg.fullPath, 'package.json'),
            dest: join(pkg.fullPath, option.outPrefix ?? ''),
          },
        ],
      })
    );
  }

  if (option.handleConfig) {
    return option.handleConfig(config);
  }

  return config;
}

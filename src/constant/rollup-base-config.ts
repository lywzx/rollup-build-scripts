import { IPackageConfig, IRollupConfig, IEntryOption } from '../interfaces';
import { isFile } from '../util';
import { isString, isArray } from 'lodash';
import { join } from 'path';

export const banner = `/*!
 * <%= package.name %> v<%= package.version%>
 * (c) ${new Date().getFullYear()} <%= package.author%>
 * @license <%= package.license %>
 */`;

export function parseValueToString(option?: string | string[]): Array<string | RegExp> | undefined {
  if (isString(option)) {
    option = option
      .split(',')
      .map((i) => i.trim())
      .filter((i) => {
        if (i === '*') {
          return false;
        }
        return !!i;
      });
  }
  if (isArray(option) && option.length) {
    return option.map((it) => {
      if (it.startsWith('*')) {
        return new RegExp(`${it.replace('*', '^@?[a-zA-Z._-]+')}$`);
      }
      if (it.endsWith('*')) {
        return new RegExp(`^${it.replace('*', '[a-zA-Z._-]+$')}`);
      }
      if (it.includes('*')) {
        return new RegExp(`^${it.replace('*', '[a-zA-Z._-]+')}$`);
      }
      return it;
    });
  }
  return undefined;
}

/**
 * 加载rollup配置文件
 *
 * @param file
 * @param root
 */
export async function loadRollupConfig(file = '.rollup.config.js', root = process.cwd()): Promise<IRollupConfig> {
  const realPath = join(root, file);
  const config = (await isFile(realPath)) ? require(realPath) : argv;
  const enableTs = argv.ts ?? config.ts ?? false;
  const enableDts = argv.dts ?? config.dts ?? true;
  const onlyEntry = argv['only-entry'] || config.onlyEntry;

  return {
    ts: enableTs,
    watch: argv.w ?? argv.watch ?? false,
    dts: enableTs ? (typeof enableDts === 'string' ? enableDts != 'false' : enableDts) : false,
    tsconfig: argv.tsconfig ?? config.tsconfig ?? 'tsconfig.json',
    tsconfigOverride: config.tsconfigOverride ?? {},
    json: argv.json ?? config.json ?? false,
    input: argv.input ?? config.input,
    inputPrefix: argv['input-prefix'] ?? config.inputPrefix ?? '',
    banner: config.banner ?? banner,
    outPrefix: argv['output-prefix'] ?? config.outPrefix ?? 'dist',
    outLibrary: argv['output-lib'] ?? config.outLibrary ?? '',
    outRootPath: argv['output-root-path'] ?? config.outRootPath ?? '',
    rollupPath: argv['rollup-path'] ?? config.rollupPath ?? 'node_modules/.bin/rollup',
    workspace: parseValueToString(argv.workspace) ?? config.workspace,
    onlyPackage: parseValueToString(argv['only-package']) ?? config.onlyPackage,
    sourcemap: argv.sourcemap ?? config.sourcemap ?? true,
    buble: config.buble,
    commonjs: config.commonjs,
    extensions: config.extensions,
    replace: config.replace,
    externalEachOther: config.externalEachOther ?? false,
    external: config.external ?? {},
    outputGlobals: config.outputGlobals ?? {},
    /**
     * 处理输入的package.json文件
     * @param input
     */
    handleCopyPackageJson: (input: Record<string, any>) => {
      if (typeof config.handleCopyPackageJson === 'function') {
        return config.handleCopyPackageJson(input);
      }
      return input;
    },
    onlyEntry: (input: IEntryOption, pkg: IPackageConfig) => {
      if (typeof onlyEntry === 'function') {
        return config.onlyEntry(input, pkg);
      }
      if (typeof onlyEntry === 'string') {
        return filterEntryByString(input, pkg, onlyEntry);
      }
      if (isIRollupConfigEntryFilter(onlyEntry)) {
        return filterEntryByRollupConfigEntryFilter(input, pkg, onlyEntry);
      }
      if (onlyEntry && onlyEntry[pkg.packageConfig.name]) {
        return filterEntryByRollupConfigEntryFilter(input, pkg, config.onlyEntry[pkg.packageConfig.name]);
      }
      return true;
    },
    handleConfig: config.handleConfig,
  } as IRollupConfig;
}

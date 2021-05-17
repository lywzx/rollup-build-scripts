import { IPackageConfig, IRollupConfig, IEntryOption } from '../interfaces';
import { filterEntryByRollupConfigEntryFilter, isFile, isIRollupConfigEntryFilter } from '../util';
import { argv } from '../argv';
import { isString, isArray } from 'lodash';
import { join } from 'path';

export const banner = `/*!
 * <%= package.name %> v<%= package.version%>
 * (c) ${new Date().getFullYear()} <%= package.author%>
 * @license <%= package.license %>
 */`;

function parseValueToString(option?: string | string[]): string[] | undefined {
  if (isString(option)) {
    return option.split(',').filter((i) => !!i);
  }
  if (isArray(option)) {
    return option;
  }
  return undefined;
}

export function loadRollupConfig(file = '.rollup.config.js'): IRollupConfig {
  const realPath = join(process.cwd(), file);
  const config = isFile(realPath) ? require(realPath) : argv;
  const enableTs = argv.ts ?? config.ts ?? false;
  const enableDts = argv.dts ?? config.dts ?? true;

  return {
    ts: enableTs,
    watch: process.argv.includes('-w'),
    dts: enableTs ? enableDts : false,
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
    onlyEntry: (input: IEntryOption, pkg: IPackageConfig) => {
      if (typeof config.onlyEntry === 'function') {
        return config.onlyEntry(input, pkg);
      }
      if (isIRollupConfigEntryFilter(config.onlyEntry)) {
        return filterEntryByRollupConfigEntryFilter(input, pkg, config.onlyEntry);
      }
      if (config.onlyEntry && config.onlyEntry[pkg.packageConfig.name]) {
        return filterEntryByRollupConfigEntryFilter(input, pkg, config.onlyEntry[pkg.packageConfig.name]);
      }
      return true;
    },
    handleConfig: config.handleConfig,
  } as IRollupConfig;
}

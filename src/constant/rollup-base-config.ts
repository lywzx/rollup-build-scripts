import { IPackageConfig, IRollupConfig } from '../interfaces/package-option';
import { filterEntryByRollupConfigEntryFilter, isFile, isIRollupConfigEntryFilter } from '../util';
import { argv } from '../argv';
import { isString, isArray } from 'lodash';
import { IEntryOption } from '../interfaces/entry-option';
import { join } from 'path';

export const banner = `/*!
 * <%= package.name %> v<%= package.version%>
 * (c) ${new Date().getFullYear()} <%= package.author%>
 * @license <%= package.license %>
 */`;

function parseValueToString(option?: string | string[]): string[] | undefined {
  if (isString(option)) {
    return option.split(',');
  }
  if (isArray(option)) {
    return option;
  }
  return undefined;
}

export function loadRollupConfig(file = join(process.cwd(), '.rollup.config.js')): IRollupConfig {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const config = isFile(file) ? require(file) : argv;

  return {
    ts: argv.ts ?? config.ts,
    tsconfig: argv.tsconfig ?? config.tsconfig ?? 'tsconfig.json',
    tsconfigOverride: config.tsconfigOverride ?? {},
    json: argv.json ?? config.json ?? false,
    input: argv.input ?? config.input,
    inputPrefix: argv.inputPrefix ?? config.inputPrefix,
    banner: config.banner ?? banner,
    outPrefix: argv.outPrefix ?? config.outPrefix ?? 'dist',
    outRootPath: argv.outRootPath ?? config.outRootPath,
    rollupPath: argv.rollupPath ?? config.rollupPath ?? 'node_modules/rollup/dist/bin/rollup',
    workspace: parseValueToString(argv.workspace) ?? config.workspace,
    onlyPackage: parseValueToString(argv.onlyPackage) ?? config.onlyPackage,
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

import { GlobalsOption, InputOptions } from 'rollup';
import { IEntryOption } from './entry-option';
import { RollupBubleOptions } from '@rollup/plugin-buble';
import { RollupCommonJSOptions } from '@rollup/plugin-commonjs';
import { RollupReplaceOptions } from '@rollup/plugin-replace';
import { ICliBuild, ICliBuildDirectory, ICliEnterFilter } from './cli';

export interface IPackageConfig {
  workspace: string;
  dir: string;
  fullPath: string;
  packageName: string;
  packageConfig: Record<string, any>;
}

/**
 * 处理dts rollup 配置信息
 */
export interface IDtsRollupConfig {
  input?: string;
  output?: string;
}

/**
 * rbs config interface
 */
export interface RbsConfig extends ICliEnterFilter, ICliBuild, ICliBuildDirectory {
  /**
   * 是否启用dts合并
   * 如果ts为true时
   * 默认自动开启
   */
  dtsOption?: IDtsRollupConfig;
  /**
   * 需要重写tsconfig的内容
   */
  tsconfigOverride?: Record<string, any>;
  /**
   * 如果配置buble
   */
  buble?: RollupBubleOptions | ((input: IEntryOption, pkg: IPackageConfig) => Promise<RollupBubleOptions>);
  /**
   * commonjs 默认配置
   */
  commonjs?: RollupCommonJSOptions | ((input: IEntryOption, pkg: IPackageConfig) => Promise<RollupBubleOptions>);
  /**
   * @rollup/plugin-replace 插件配置
   * @param input
   * @param pkg
   */
  replace?: RollupReplaceOptions | ((input: IEntryOption, pkg: IPackageConfig) => Promise<RollupReplaceOptions>);
  /**
   * 引用全局变量名称
   */
  outputGlobals?: GlobalsOption | Record<string, GlobalsOption>;
  /**
   * 限制构建包类型
   */
  onlyEntry?:
    | string
    | IRollupConfigOnlyEntry
    | IRollupConfigEntryFilter
    | ((input: IEntryOption, pkg: IPackageConfig) => boolean);

  /**
   * 处理文件复制package.json文件复制，修改内容
   * @param pkg
   */
  handleCopyPackageJson?(pkg: Record<string, any>): Record<string, any>;
  /**
   * 可以自定议修改rollup的配置文件
   * @param config
   * @param pkg
   */
  handleConfig?(config: InputOptions, pkg: IPackageConfig): InputOptions;
}

export interface IRollupConfigEntryFilter {
  /**
   * 是否支持browser
   */
  browser?: boolean;
  /**
   * 只构建某一种类型
   */
  format?: string | string[];
  /**
   * 是否压缩
   */
  minify?: boolean;
}

export interface IRollupConfigOnlyEntry {
  [s: string]: IRollupConfigEntryFilter;
}

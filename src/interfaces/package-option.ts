import { ExternalOption, GlobalsOption, InputOptions } from 'rollup';
import { IEntryOption } from './entry-option';
import { RollupBubleOptions } from '@rollup/plugin-buble';
import { RollupCommonJSOptions } from '@rollup/plugin-commonjs';
import { RollupReplaceOptions } from '@rollup/plugin-replace';

export interface IPackageConfig {
  workspace: string;
  dir: string;
  fullPath: string;
  packageConfig: Record<string, any>;
}

export interface IRollupConfig {
  /**
   * 是否启用typescript构建
   * 默认：true
   */
  ts: boolean;
  /**
   * tsconfig配置文件
   * 默认值 tsconfig.json
   */
  tsconfig?: string;
  /**
   * 需要重写tsconfig的内容
   */
  tsconfigOverride?: Record<string, any>;
  /**
   * 支持json转成es6模块
   */
  json?: boolean;
  /**
   * 构建的入口文件
   */
  input?: string;
  /**
   * 构建时input的前缀
   */
  inputPrefix?: string;
  /**
   * 使用的banner内容
   */
  banner?: string;
  /**
   * 文件输入的默认路径
   * 默认为dest
   */
  outPrefix?: string;
  /**
   * 输出的根目录，
   * 将会按照包名来输出
   */
  outRootPath?: string;
  /**
   * rollup安装的目录
   */
  rollupPath?: string;
  /**
   * 当为workspace模式时，
   * 可以填写此值
   */
  workspace?: string[];
  /**
   * 只构建以下列举的包
   */
  onlyPackage?: string[];
  /**
   * 是否要生成sourcemap
   * 默认： true
   */
  sourcemap?: boolean;
  /**
   * 如果配置buble
   */
  buble?: RollupBubleOptions;
  /**
   * commonjs 默认配置
   */
  commonjs?: RollupCommonJSOptions;
  /**
   * @rollup/plugin-replace 插件配置
   * @param input
   * @param pkg
   */
  replace?: RollupReplaceOptions | ((input: IEntryOption, pkg: IPackageConfig) => RollupReplaceOptions);
  /**
   * 默认查找的扩展名
   */
  extensions: string[];
  /**
   * 当为workspace模式时，
   * 让其他的包作为exeternal引入
   */
  externalEachOther: boolean;
  /**
   * 指定external依赖
   */
  external?: ExternalOption | Record<string, ExternalOption>;
  /**
   * 引用全局变量名称
   */
  outputGlobals?: GlobalsOption | Record<string, GlobalsOption>;
  /**
   * 限制构建包类型
   */
  onlyEntry?:
    | IRollupConfigOnlyEntry
    | IRollupConfigEntryFilter
    | ((input: IEntryOption, pkg: IPackageConfig) => boolean);
  /**
   * 可以自定议修改rollup的配置文件
   * @param config
   */
  handleConfig(config: InputOptions): InputOptions;
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
}

export interface IRollupConfigOnlyEntry {
  [s: string]: IRollupConfigEntryFilter;
}

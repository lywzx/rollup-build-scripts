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

/**
 * 处理dts rollup 配置信息
 */
export interface IDtsRollupConfig {
  input?: string;
  output?: string;
}

export interface IRollupConfig {
  /**
   * 是否watch模式
   * dev
   */
  watch: boolean;
  /**
   * 是否启用typescript构建
   * 默认：true
   */
  ts: boolean;
  /**
   * 是否启用dts合并
   * 如果ts为true时
   * 默认自动开启
   */
  dts?: boolean | IDtsRollupConfig;
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
   * 比如放在包的src目录，可以填写为 src
   */
  inputPrefix?: string;
  /**
   * 使用的banner内容
   */
  banner?: string;
  /**
   * 包中文件的输出路径
   * 比如：所有构建代码需要放到library目录
   */
  outLibrary?: string;
  /**
   * 输出的目录，
   * 仅当outRootPath不存在时，起作用
   */
  outPrefix?: string;
  /**
   * 输出的根目录，
   * 将会按照包名来生成目录，
   * 适用将包输入到某个项目的node_modules
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
   * @param pkg
   */
  handleConfig(config: InputOptions, pkg: IPackageConfig): InputOptions;
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

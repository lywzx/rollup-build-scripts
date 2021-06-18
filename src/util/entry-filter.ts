import { IEntryOption, IPackageConfig, IRollupConfigEntryFilter } from '../interfaces';

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
 * 通过字段串来筛选出入口
 *
 * @param input
 * @param pkg
 * @param config
 */
export function filterEntryByString(input: IEntryOption, pkg: IPackageConfig, config: string) {
  const configSplit = config.split(',').map((i) => i.trim());

  // 是否要压缩
  if (configSplit.includes('minify') && input.minify === true) {
    return false;
  }

  // 是否支持浏览器
  if (configSplit.includes('browser') && !input.browser) {
    return false;
  }

  if (!configSplit.includes(input.format)) {
    return false;
  }

  return true;
}

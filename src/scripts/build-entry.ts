import { argv } from '../argv';
import { getAllPackages, getAllPackagesEntry } from '../util';
import { loadRollupConfig } from '../constant';

/**
 * 生成rollup构建所需要的entry
 */
export function getAllEntry() {
  const option = loadRollupConfig(argv.config);
  const allPackage = getAllPackages(option);

  const allEntry = getAllPackagesEntry(allPackage, option);

  return allEntry;
}

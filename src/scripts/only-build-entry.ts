import { argv } from '../argv';
import { getAllPackages, getAllPackagesRollupEntry } from '../util';
import { loadRollupConfig } from '../constant';

/**
 * 生成rollup构建所需要的entry
 */
export function generateRollupAllAvailableEntries() {
  const option = loadRollupConfig(argv['r-config']);
  const allPackage = getAllPackages(option);

  return getAllPackagesRollupEntry(allPackage, option);
}

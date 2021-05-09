import { argv } from '../argv';
import { filterOnlyPackages, generateRollupConfig, getAllPackages } from '../util';

/**
 * 生成rollup构建所需要的entry
 */
export function getAllEntry() {
  const allPackage = getAllPackages(argv.workspace);
  const filterPackage = filterOnlyPackages(allPackage, argv.onlyPackage);

  const allEntry = filterPackage.map((pkg) => {
    return generateRollupConfig(pkg)
  });
}

import { clearDirs, filteredPackages, scanWorkspacePackages } from '../util';
import { join } from 'path';
import { CleanOption } from '../util/merge-rbs-config';

/**
 * clean directory
 * @param option
 */
export async function clean(option: CleanOption) {
  const allPackages = await scanWorkspacePackages(option.workspace || '.', {
    rootPath: option.rootPath,
  });
  const filterPackages = filteredPackages(allPackages, option);

  const clearDirsArray =
    typeof option.outputRootPath === 'string'
      ? filterPackages.map((pkg) => {
          return join(option.outputRootPath!, pkg.packageName);
        })
      : filterPackages.map((pkg) => {
          return join(pkg.fullPath, option.outputPrefix);
        });

  await clearDirs(clearDirsArray);
}

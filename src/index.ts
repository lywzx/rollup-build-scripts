import { ICliBuildDirectory, ICliEnterFilter } from './interfaces';
import { clearDirs, filteredPackages, scanWorkspacePackages } from './util';
import { join } from 'path';

export * from './interfaces';

/**
 * clean command data
 * @param option
 */
export async function clean(option: ICliBuildDirectory & ICliEnterFilter) {
  const allPackages = await scanWorkspacePackages(option.workspace || '.');
  const filterPackages = filteredPackages(allPackages, option);
  await clearDirs(
    filterPackages.map((i) => {
      return join(i.fullPath, option.outputPrefix || '');
    })
  );
}

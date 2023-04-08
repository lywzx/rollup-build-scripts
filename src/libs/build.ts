import { RbsConfig } from '../interfaces';
import { filteredPackages, scanWorkspacePackages } from '../util';

/**
 * roll build function
 */
export async function build(option: RbsConfig & { rootPath: string; }) {

  const allPackages = await scanWorkspacePackages(option.workspace || '.', {
    rootPath: option.rootPath,
  });
  const filterPackages = filteredPackages(allPackages, option);


}

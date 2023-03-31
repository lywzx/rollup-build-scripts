import { ICliBuildDirectory, ICliEnterFilter } from '../interfaces';

export type CleanOption = ICliBuildDirectory &
  ICliEnterFilter & {
    rootPath: string;
  };

/**
 * guess rbs directory
 * @param option
 */
export async function guessRbsBuildDirectoryConfig(option: CleanOption): Promise<CleanOption> {
  return option;
}

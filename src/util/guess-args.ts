
export interface IGuessRbsConfigPathOption {
  /**
   * config file name
   */
  filename: string | string[];
  /**
   * current root path
   */
  root?: string;
  /**
   * parent level depth
   */
  levelDepth?: number;
}

/**
 * guess rbs config path
 * @param option
 */
export async function guessRbsConfigPath(option: IGuessRbsConfigPathOption = { filename: ['ts', 'js'].map(i => `.rollup.config.${i}`)}): Promise<string> {
  const {
    filename = ['ts', 'js'].map(i => `.rollup.config.${i}`),
    root = process.cwd(),
    levelDepth = 3,
  } = option;

  const stack: string[] = [];


  while () {

  }


}


/**
 *
 */
export async function guessRbsRootPackageJson(): Promise<string> {
  return '';
}


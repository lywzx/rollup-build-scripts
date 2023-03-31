import { castArray } from './helper';
import { isFile } from './dir';
import { join, normalize } from 'path';
import { readFile } from './fs';

export interface IGuessConfigPathOption {
  /**
   * config file name
   */
  filename?: string | string[];
  /**
   * current root path
   */
  root?: string;
  /**
   * parent level depth
   */
  levelDepth?: number;
}

export interface IGuessConfigValidateOption {
  /**
   * path
   */
  path: string;
  /**
   * current file name
   */
  filename: string;
  /**
   * current level
   */
  level: number;
}

export interface IScanStackItem {
  validatedResult?: (current: IGuessConfigValidateOption) => Promise<boolean>;
  validatedContinue?: (current: IGuessConfigValidateOption) => boolean;
}

/**
 * guess rbs config path
 * @param option
 * @param validate
 */
export async function guessConfigPath(
  option: IGuessConfigPathOption = {},
  validate: IScanStackItem = {}
): Promise<string | undefined> {
  const { filename = [], root = process.cwd() } = option;

  const {
    validatedResult = (current) => {
      const filePath = join(current.path, current.filename);
      return isFile(filePath);
    },
    validatedContinue = (current) => {
      return current.level < 3;
    },
  } = validate;

  const defaultFilename = castArray(filename);

  const generateStack = (data: Omit<IGuessConfigValidateOption, 'filename'>): Array<IGuessConfigValidateOption> => {
    return defaultFilename.map((filename) => {
      return {
        ...data,
        filename,
      };
    });
  };

  const stack = generateStack({
    path: root,
    level: 0,
  });

  while (!!stack.length) {
    const currentStack = stack.shift()!;
    if (await validatedResult(currentStack)) {
      return join(currentStack.path, currentStack.filename);
    }
    if (validatedContinue(currentStack)) {
      stack.push(
        ...generateStack({
          level: currentStack.level + 1,
          path: normalize(join(currentStack.path, '..')),
        })
      );
    }
  }
}

/**
 * find .rollup.config.js config file
 * @param filename
 * @param root
 * @param scanLevel
 */
export function guessRbsConfigPath(
  filename: string | string[] = ['ts', 'js'].map((i) => `.rollup.config.${i}`),
  root = process.cwd(),
  scanLevel = 3
) {
  return guessConfigPath({ filename, root }, { validatedContinue: (current) => current.level < scanLevel });
}

/**
 * scan relative package.json file
 * @param root
 * @param scanLevel
 */
export function guessRelativePackageJson(root = process.cwd(), scanLevel = 3) {
  return guessConfigPath(
    {
      filename: 'package.json',
      root,
    },
    {
      validatedContinue: (current) => current.level < scanLevel,
    }
  );
}

/**
 * find root package.json file
 * @param root
 * @param scanLevel
 */
export async function guessRbsRootPackageJson(root = process.cwd(), scanLevel = 3) {
  const workspacePackageJson = await guessConfigPath(
    {
      filename: 'package.json',
      root,
    },
    {
      validatedResult: async (current) => {
        const filePath = join(current.path, current.filename);
        if (await isFile(filePath)) {
          const fileContent = await readFile(filePath, { encoding: 'utf-8' });
          const data = JSON.parse(fileContent);
          if (typeof data === 'object' && data.private && data.workspace && data.workspace.length) {
            return true;
          }
        }
        return false;
      },
      validatedContinue: (current) => current.level < scanLevel,
    }
  );

  if (workspacePackageJson) {
    return workspacePackageJson;
  }

  return guessRelativePackageJson(root, scanLevel);
}

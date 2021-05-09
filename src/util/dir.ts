import execa from 'execa';
import { existsSync, lstatSync, } from 'fs';

/**
 * clear dir
 * @param dirs
 */
export function clearDirs(dirs: string[]) {
  if (dirs.length) {
    return execa('rimraf', dirs);
  }
}

/**
 * 判断某个文件是否存在
 * @param file
 */
export function fileExists(file: string): boolean {
  if (existsSync(file)) {
    const stat = lstatSync(file);
    return stat.isFile();
  }
  return false;
}

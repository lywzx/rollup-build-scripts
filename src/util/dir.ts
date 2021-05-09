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
 * 判断当前路么是否为文件
 * @param file
 */
export function isDirectory(file: string): boolean {
  if (existsSync(file)) {
    const stat = lstatSync(file);
    return stat.isDirectory();
  }
  return false;
}

/**
 * 判断某个文件是否存在
 * @param file
 */
export function isFile(file: string): boolean {
  if (existsSync(file)) {
    const stat = lstatSync(file);
    return stat.isFile();
  }
  return false;
}

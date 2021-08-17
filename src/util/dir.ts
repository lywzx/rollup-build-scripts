import del from 'del';
import { existsSync, lstatSync } from 'fs';

/**
 * clear dir
 * @param dirs
 */
export async function clearDirs(dirs: string[]) {
  if (dirs.length) {
    await del(dirs, {
      force: true,
    });
  }
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

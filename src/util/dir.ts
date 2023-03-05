import del from 'del';
import { stat } from './fs';

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
 * @param path
 */
export async function isFile(path: string): Promise<boolean> {
  try {
    const pathStat = await stat(path);
    return pathStat.isFile();
  } catch (e) {
    return false;
  }
}

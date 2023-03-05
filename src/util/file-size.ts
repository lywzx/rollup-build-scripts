import { compress } from 'brotli';
import { bold, gray } from 'chalk';
import { gzip, readFile } from './fs';

/**
 * check all file size
 * @param files
 */
export async function checkAllSizes(files: string[]) {
  console.log();
  const filesClone = files.slice();
  let currentFile: string | undefined;
  while ((currentFile = filesClone.shift())) {
    await checkSize(currentFile);
  }
  console.log();
}

/**
 * check filePath size
 * @param filePath
 */
export async function checkSize(filePath: string) {
  const file = await readFile(filePath);
  const minSize = (file.length / 1024).toFixed(2) + 'kb';
  const gzipped = await gzip(file);
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';
  const compressed = compress(file);
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
  console.log(`${gray(bold(filePath))} size:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`);
}

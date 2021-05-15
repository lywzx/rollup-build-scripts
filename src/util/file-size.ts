import { compress } from 'brotli';
import { bold, gray } from 'chalk';
import { readFileSync } from 'fs';
import { gzipSync } from 'zlib';

/**
 * check all file size
 * @param files
 */
export function checkAllSizes(files: string[]) {
  console.log();
  files.forEach((f) => checkSize(f));
  console.log();
}

/**
 * check file size
 * @param file
 */
export function checkSize(file: string) {
  const f = readFileSync(file);
  const minSize = (f.length / 1024).toFixed(2) + 'kb';
  const gzipped = gzipSync(f);
  const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';
  const compressed = compress(f);
  const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
  console.log(`${gray(bold(file))} size:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`);
}

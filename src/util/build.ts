import { join } from 'path';
import { readFileSync } from 'fs';
import { gzipSync } from 'zlib';
import { compress } from 'brotli';
import { gray, bold } from 'chalk';
import { InputOptions } from 'rollup';
import { IPackageConfig } from '../interfaces/package-option';
import { isFile } from './dir';

/**
 * 生成文件的输入内容
 * @param file
 * @param filePrefix
 */
export function generateFilePath(file = 'build.ts', filePrefix?: string): string {
  if (typeof filePrefix === 'undefined') {
    return file;
  }
  return join(filePrefix, file);
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

/**
 * 加载项目当中
 */
function loadRollConfigBuildConfig(file = '.rollup.config.js'): (config: InputOptions) => InputOptions {
  if (isFile(file)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(file).default;
  }
  return (config) => config;
}

/**
 * 生成rollup的配置
 * @param config
 */
export function generateRollupConfig(iPackage: IPackageConfig): InputOptions {
  const config:InputOptions = {
    input: '',
  };



  // 加载默认的配置项
  return loadRollConfigBuildConfig()(config);
}


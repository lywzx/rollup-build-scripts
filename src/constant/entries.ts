import { generateFilePath } from '../util';
import { argv } from '../argv';
import { IEntryOption } from '../interfaces/entry-option';

const input = generateFilePath(argv.input, argv.inputPrefix);

/**
 * 默认所有允许的entry
 */
export const entries: IEntryOption[] = [
  {
    input,
    file: generateFilePath('index.esm.browser.js', argv.outPrefix),
    format: 'es',
    browser: true,
    transpile: false,
    env: 'development',
  },
  {
    input,
    file: generateFilePath('index.esm.browser.min.js', argv.outPrefix),
    format: 'es',
    browser: true,
    transpile: false,
    minify: true,
    env: 'production',
  },
  // todo remove transpile
  { input, file: generateFilePath('index.esm.js', argv.outPrefix), format: 'es', transpile: false, env: 'development' },
  { input, file: generateFilePath('index.js', argv.outPrefix), format: 'umd', transpile: false, env: 'development' },
  {
    input,
    file: generateFilePath('index.min.js', argv.outPrefix),
    format: 'umd',
    transpile: false,
    minify: true,
    env: 'production',
  },
  {
    input,
    file: generateFilePath('index.common.js', argv.generateFilePath),
    format: 'cjs',
    transpile: false,
    env: 'development',
  },
];

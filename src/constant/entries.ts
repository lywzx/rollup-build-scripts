import { IEntryOption } from '../interfaces';

/**
 * 默认所有允许的entry
 */
export const entries = (ts: boolean): IEntryOption[] => {
  const input = `index.${ts ? 'ts' : 'js'}`;

  return [
    {
      input,
      file: 'index.esm.browser.js',
      format: 'es',
      browser: true,
      transpile: false,
      env: 'development',
    },
    {
      input,
      file: 'index.esm.browser.min.js',
      format: 'es',
      browser: true,
      transpile: false,
      minify: true,
      env: 'production',
    },
    // todo remove transpile
    { input, file: 'index.esm.js', format: 'es', transpile: false, env: 'development' },
    { input, file: 'index.js', format: 'umd', transpile: false, env: 'development' },
    {
      input,
      file: 'index.min.js',
      format: 'umd',
      transpile: false,
      minify: true,
      env: 'production',
    },
    {
      input,
      file: 'index.common.js',
      format: 'cjs',
      transpile: false,
      env: 'development',
    },
  ];
};

import { IEntryOption } from '../interfaces/entry-option';

/**
 * 默认所有允许的entry
 */
const entries: IEntryOption[] = [
    {
        input: 'src/index.ts',
        file: 'index.esm.browser.js',
        format: 'es',
        browser: true,
        transpile: false,
        env: 'development',
    },
    {
        input: 'src/index.ts',
        file: 'index.esm.browser.min.js',
        format: 'es',
        browser: true,
        transpile: false,
        minify: true,
        env: 'production',
    },
    // todo remove transpile
    { input: 'src/index.ts', file: 'index.esm.js', format: 'es', transpile: false, env: 'development' },
    { input: 'src/index.ts', file: 'index.js', format: 'umd', transpile: false, env: 'development' },
    { input: 'src/index.ts', file: 'index.min.js', format: 'umd', transpile: false, minify: true, env: 'production' },
    { input: 'src/index.ts', file: 'index.common.js', format: 'cjs', transpile: false, env: 'development' },
];

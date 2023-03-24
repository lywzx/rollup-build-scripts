import { createCommand } from 'commander';

const command = createCommand('rbs').description('quickly building library files based on Rollup.js').version('0.0.7');

command
  .command('build')
  .description('building your library')
  .option('-w, --workspace <workspace>', 'enable workspace mode and input the working directory', '.')
  .option('-ts, --enable-typescript', 'enable typescript', false)
  .option('-dts, --enable-dts', 'enable typescript declaration merging', false)
  .option('-f, --only-entry <onlyEntry>', 'when in workspace mode, only build the specified package')
  .option('-j, --enable-json-plugin', 'enable @rollup/plugin-json', false)
  .option('-tc, --tsconfig <tsconfig>', 'specify the path to the TypeScript configuration file', 'tsconfig.json')
  .option('-i, --input <input>', 'specify the entry file for the build.', 'index.ts')
  .option('-ip, --input-prefix <inputPrefix>', 'specify the path prefix for the entry file.', '')
  .option(
    '-b, --banner-text <bannerText>',
    'specify build result banner text.',
    `/*!
 * <%= package.name %> v<%= package.version%>
 * (c) ${new Date().getFullYear()} <%= package.author%>
 * @license <%= package.license %>
 */`
  )
  .option('-op, --output-prefix <outputPrefx>', 'Specify the directory prefix for the output.', '')
  .option('-s, --enable-sourcemap', 'enable output sourcemap')
  .option('-ee, --external-each-other', 'when workspace mode, all model as external each other.', true)
  .action(function (...args) {
    console.log(...args);
  });

// https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md

command.parse();

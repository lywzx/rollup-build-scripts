import { Command, createCommand } from 'commander';
import { ICliBuild, ICliBuildDirectory, ICliEnterFilter } from './interfaces';
import { readFileSync } from 'fs';
import { join } from 'path';
import { build, clean } from './index';
import { guessRbsBuildDirectoryConfig, guessRbsBuildOptionConfig } from './util/merge-rbs-config';

const packageInfo = JSON.parse(readFileSync(join(__dirname, '../package.json'), { encoding: 'utf-8' }));

const command = createCommand('rbs')
  .description('quickly building library files based on Rollup.js')
  .version(packageInfo.version);

/**
 * build command common args
 * @param command
 */
function buildCommandArgs(command: Command) {
  return command
    .option('-c, --config [config]', 'configuration file location')
    .option('-ts, --enable-typescript', 'enable typescript', false)
    .option('-dts, --enable-dts', 'enable typescript declaration merging', false)
    .option('-ej, --enable-json-plugin', 'enable @rollup/plugin-json', false)
    .option('-eb, --enable-browser', 'enable browser support')
    .option('-tc, --tsconfig <tsconfig>', 'specify the path to the TypeScript configuration file', 'tsconfig.json')
    .option('-i, --input [input...]', 'specify the entry file for the build.', ['index.ts'])
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
    .option('-es, --enable-sourcemap', 'enable output sourcemap')
    .option('-et, --external [packages...]', 'build external package')
    .option('-ee, --external-each-other', 'when workspace mode, all package as external each other.', true)
    .option('-cp, --copy [files...]', 'copy files', ['README.md', 'LICENSE', 'CHANGELOG.md'])
    .option('-bf, --build-format [fileFormat...]', 'build file format. eg: es,umd,cjs', ['es', 'umd', 'cjs'])
    .option('-m, --minify [minify]', 'bundle file need minify')
    .option('--ext, --extension [extension...]', 'file extensions');
}

/**
 * build directory
 *
 * @param command
 */
function buildDirectory(command: Command) {
  return command
    .option('-w, --workspace [workspace...]', 'enable workspace mode and input the working directory')
    .option('orp, --output-root-path <outputRootPath>', 'Specify the root directory for the output')
    .option('opi, --output-library <ouputLibraryPath>', 'specify the directory prefix for the package')
    .option('-op, --output-prefix <outputPrefx>', 'Specify the directory prefix for the output.', 'dist')
    .option('-dd, --directory-depth <directoryDepth>', 'scan directory dept', '3');
}

/**
 * package filter entry
 * @param command
 */
function buildPackageFilter(command: Command) {
  return command
    .option('-op, --only-package <onlyPackage>', 'when in workspace mode, only build the specified package')
    .option('-ep, --exclude-package <excludePackage>', 'when in workspace mode, build the exclude package');
}

/**
 * create build command
 * @param name
 * @param description
 * @param args
 */
function createCommandAction(
  name: string,
  description: string,
  args: Array<(command: Command) => Command> = []
): Command {
  return args.reduce(function (cmd, prev) {
    return prev(cmd);
  }, command.command(name).description(description));
}

/**
 * build command
 */
createCommandAction('build', 'building your library', [buildDirectory, buildCommandArgs, buildPackageFilter]).action(
  async function (option: ICliBuildDirectory & ICliBuild & ICliEnterFilter, command) {
    const opt = await guessRbsBuildOptionConfig({
      ...option,
      rootPath: process.cwd(),
    });
    return build(opt);
  }
);

/**
 * dev command
 */
createCommandAction('dev', 'watch file changes and build in real-time', [
  buildDirectory,
  buildCommandArgs,
  buildPackageFilter,
]).action(function (option, command) {});

/**
 * clean command
 */
createCommandAction('clean', 'clean build artifacts', [buildDirectory, buildPackageFilter]).action(async function (
  option: ICliBuildDirectory & ICliEnterFilter,
  command
) {
  const opt = await guessRbsBuildDirectoryConfig({
    ...option,
    rootPath: process.cwd(),
  });

  return clean(opt);
});

command.parse();

import { Command, createCommand } from 'commander';

const command = createCommand('rbs').description('quickly building library files based on Rollup.js').version('0.0.7');

function buildDirectory(command: Command) {
  return command.option('-w, --workspace [workspace...]', 'enable workspace mode and input the working directory');
}

function buildCommandArgs(command: Command) {
  return command
    .option('-c, --config [config]', 'configuration file location')
    .option('-ts, --enable-typescript', 'enable typescript', false)
    .option('-dts, --enable-dts', 'enable typescript declaration merging', false)
    .option('-f, --only-entry <onlyEntry>', 'when in workspace mode, only build the specified package')
    .option('-e, --exclude-entry <excludeEntry>', 'when in workspace mode, build the exclude package')
    .option('-ej, --enable-json-plugin', 'enable @rollup/plugin-json', false)
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
    .option('-et, --external [packages...]', 'build external package')
    .option('-ee, --external-each-other', 'when workspace mode, all model as external each other.', true)
    .option('-cp, --copy [files...]', 'copy files', ['README.md', 'LICENSE', 'CHANGELOG.md'])
    .option('-bf, --build-format [fileFormat...]', 'build file format. eg: es,umd,cjs', ['es', 'umd', 'cjs'])
    .option('-m, --minify [minify...]');
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
createCommandAction('build', 'building your library', [buildDirectory, buildCommandArgs]).action(function (
  option,
  command
) {});

/**
 * dev command
 */
createCommandAction('dev', 'watch file changes and build in real-time', [buildDirectory, buildCommandArgs]).action(
  function (option, command) {}
);

/**
 * clean command
 */
createCommandAction('clean', 'clean build artifacts', [buildDirectory]).action(function (option, command) {

});

command.parse();

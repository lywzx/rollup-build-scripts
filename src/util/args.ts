import minimist from 'minimist';

/**
 * 获取控制台传入的参数信息
 * @param argv
 */
export function getArgsArray(argv = process.argv.slice(2)) {
  return minimist(argv);
}

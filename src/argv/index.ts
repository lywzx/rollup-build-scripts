import minimist from 'minimist';

/**
 * 所有的argv参数
 * --input 文件输入的路径
 * --input-prefix 输入的文件前缀
 * --out-prefix 输出文件的前缀
 * --workspace 工作区
 * --config 配置文件
 */
export const argv = minimist(process.argv.slice(2));

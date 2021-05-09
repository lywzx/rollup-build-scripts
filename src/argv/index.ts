import minimist from 'minimist';

/**
 * 所有的argv参数
 * --input 文件输入的路径
 * --input-prefix 输入的文件前缀
 * --out-prefix 输出文件的前缀
 * --workspace 工作区
 * --config 配置文件
 * --out-root-path 输入的根目录，默认情况会输出到每个目录下，如果指定，会输出到指定目录
 * --rollup-path 安装的rollup的路径：默认：node_modules/rollup/dist/bin/rollup
 * --only-package 仅构建指定的包
 * --ts 启用typescript的构建，默认启用
 */
export const argv = minimist(process.argv.slice(2));
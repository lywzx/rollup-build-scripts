import { template } from 'lodash';

export const RollupBaseConfig = {
  /**
   * 文件输入内容
   */
  input: '',
  plugins: [],
  output: {
    banner: template(`/*!
 * <%= package.name %> v<%= package.version%>
 * (c) ${new Date().getFullYear()} <%= package.author%>
 * @license <%= package.license %>
 */`),
    file: '',
    format: '',
    globals: {},
    sourcemap: true,
  },
  onwarn(msg: string, warn: (...args: any[]) => any) {
    if (!/Circular/.test(msg)) {
      warn(msg);
    }
  },
  external: {},
};

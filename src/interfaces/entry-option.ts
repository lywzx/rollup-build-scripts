/**
 * 配置文件
 */
export interface IEntryOption {
    /**
     * 输入的文类型
     */
    input: string;
    /**
     * 输出的文件名称
     */
    file: string;
    /**
     * 构建的格式
     */
    format: 'es' | 'umd' | 'cjs',
    /**
     *
     */
    transpile?: boolean;

    /**
     * 是否支持浏览器
     */
    browser?: boolean;
    /**
     * 环境变量内容
     */
    env: 'production' | 'development',
    /**
     * 是否压缩
     */
    minify?: boolean;
}

# @lywzx/rollup-build-scripts

基于于rollup，只需要简单配置，即快完成包的快速构建功能。

## 安装

```bash
yarn add @lywzx/rollup-build-scripts --dev // 或 npm install @lywzx/rollup-build-scripts --save-dev
```

## 配置

在package.json中，scripts字段，添加如下配置：

```
"dev": "npx rbs dev",
"build": "npx rbs build",
"clean": "npx rbs clean"
```

下面是一些通用参数，可以


支持在命令行中传递参数：

* --ts 启用typescript构建
* --tsconfig 指定tsconfig.json文件路径
* --input 指定构建时，rollup的输入文件
* --input-prefix 如果文件位于包的src目录下，可以填写此字段
* --output-prefix 包的输出路径，相对于构建包的目录，默认为dist; 当 --output-root-path 存在时，此参数不起作用
* --output-root-path 按包名统一输出到当前目录下，一般开发环境下会使用到
* --output-lib 构建包内文件时，输出的默认路径
* --rollup-path 安装的rollup的路径，默认node_modules/.bin/rollup
* --workspace 当多包开发时，启用workspace存在时，将会自动从workspace下中查询
* --only-package 限制构建的包(支持*匹配包名)
* --only-entry 限制构建类型
  - minify 仅构建非压缩类型
  - es,umd,cjs 仅构构建以上类型入口
  - browser 仅构建浏览器的入口 
* --sourcemap 是否需要生成sourcemap
* --r-config 指定配置文件


如果以上参数，还不够功能，可以使用配置文件，创建.rollup.config.js至项目根目录，命令行中的参数将覆盖配置文件中的参数，配置示例;

```typescript
/**
 * @type {import('@lywzx/rollup-build-scripts').IRollupConfig}
 */
module.exports = {
    ts: true,
    watch: true,
    // typescript 声明文件合并
    dts: true,
    // tsconfig 文件位置
    tsconfig: argv.tsconfig ?? config.tsconfig ?? 'tsconfig.json',
    // 覆盖tsconfig配置
    tsconfigOverride: '',
    // 是否载入json插件
    json: false,
    // 构建入口文件名称
    input: 'index.ts',
    // 入口文件路径前缀
    inputPrefix: 'src',
    // 构建输出文件前缀
    // <%= package.name %> v<%= package.version%>
    // (c) <%= new Date().getFullYear() %> <%= package.author%>
    // @license <%= package.license %>
    banner: '',
    // 构建后输出路径
    outPrefix: '',
    // 构建后输入路径前缀
    outLibrary: '',
    // 将所有包输出到某个目录下
    outRootPath: '',
    // rollup命令所处位置
    rollupPath: 'node_modules/.bin/rollup',
    // 当前工作区目录
    workspace: ['packages'],
    // 只构建某些包
    onlyPackage: '',
    // 是否需要生成sourcemap
    sourcemap: false,
    // buble插件配置
    buble: {},
    // commonjs插件配置
    commonjs: {},
    // resolve时使用的扩展名
    extensions: {},
    // replace插件使用配置
    replace: {},
    // 多包模式下，构建时，是否需要把其他包作为external
    externalEachOther: config.externalEachOther ?? false,
    // 需要external的包，如lodash
    external: {},
    // 输出是全局的名称
    outputGlobals: config.outputGlobals ?? {},
    // 辅助函数，用来过滤某些入口是否构建或不构建
    onlyEntry: (input: IEntryOption, pkg: IPackageConfig) => {
        // 返回一个true或false，来控制是否要构建当前entry
        return true; 
    },
    // 辅助函数，可以在构建前，修改rollup的配置文件内容
    handleConfig(config: InputOptions, pkg: IPackageConfig): InputOptions {
        // 这里可以处理自定议的逻辑
        return config;
    },
}
```

## 包开发输出到某个目录

通常项目开发过程，需要与其他项目联调，需要将修改的内容，构建后输入到某个目录，可以使用如下命令(假定完成了上面的配置工作):

```bash
yarn dev --output-root-path=../project-demo/node_modules --only-package=@test/package1,@test/package2
```

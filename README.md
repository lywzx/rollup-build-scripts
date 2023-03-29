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

## 命名行

命令行中，所有的参数均支持`--camelCase`和`--camel-case`两种风格。

### 获得帮助

执行

`rbs -h` 

将会打印出所所有命令行参数。


### 常见参数

| 参数   | 完整参数                  | 示例                                              | 备注                                                                  |
|------|-----------------------|-------------------------------------------------|---------------------------------------------------------------------|
| -w   | --workspace           | npx rbs build -w packages -w src                | 指定工作区，默认情况下会根据package.json中workspace字段判断                            |
| -orp | --output-root-path    | npx rbs build -orp root/path                    | 指定输出的根目录。输出的结果，将会以包名输出到指定目录。当此参数存在，`--output-prefix`参数将不起作用         |
| -op  | --output-prefix       | npx rbs build -op dist                          | 指定构建产物输出位置（相对于包的位置）；默认值为: `dist`                                    |
| -c   | --config              | npx rbs build -c .rollup.config.js              | 指定rbs命令行配置文件                                                        |
| -ts  | --enable-typescript   | npx rbs build -ts                               | 是否启用typescript语法支持，默认会判断目录下是否存<br/>在tsconfig.json自行确认是否启用typescript |
| -dts | --enable-dts          | npx rbs build -dts                              | 是否通过dts来合并typescript声明                                              |
| -ej  | --enable-json-plugin  | npx rbs build -ej                               | 是否启用`@rollup/plugin-json`插件                                         |
| -eb  | --enable-browser      | npx rbs build -eb                               | 构建产物支持浏览器                                                           |
| -tc  | --tsconfig            | npx rbs build --tsconfig tsconfig.override.json | 指定typescript构建时的配置文件                                                |
| -i   | --input               | npx rbs build -i index.ts                       | 指定构建时，入口文件                                                          |
| -ip  | --input-prefix        | npx rbs build -ip src                           | 指定构建时，入口文件目录前缀                                                      |
| -b   | --banner              | npx rbs build -b '/** <=package.name> */'       | 构建后的文件顶部，填写的注释信息。支持一些变量，来源主要是package.json                           |
| -es  | --enable-sourcemap    | npx rbs build -es                               | 输出结果后，生成sourcemap文件                                                 |
| -et  | --external            | npx rbs build -et lodash -et vue                | 将某个包指定为external                                                     |
| -ee  | --external-each-other | npx rbs build -ee                               | 当使用多包模式时，多个包之间作为external                                            |
| -cp  | --copy                | npx rbs build -cp README.md -cp package.json    | 构建完成后，复制资源至构建产物的目录当中                                                |
| -bf  | --bf                  | npx rbs build -bf es -bf umd -bf cjs            | 构建后产物格式                                                             |
| -m   | --minify              | npx rbs build -m                                | 生成压缩后的产物                                                            |
| -op  | --only-package        | npx rbs build -op @lywxz/cli -f @lywzx/cc       | 当在workspace模式下，只构建某一些包的产物                                           |
| -ep  | --exclude-package     | npx rbs build -ep @lywxz/cli -f @lywzx/cc       | 当在workspace模式下，指定的包跳过构建                                             |


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
yarn dev -output-root-path=../project-demo/node_modules -only-package=@test/package1 -op=@test/package2
```

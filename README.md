# @lywzx/rollup-build-scripts

基于于rollup，只需要简单配置，即快完成包的快速构建功能。

## 安装

```bash
yarn add @lywzx/rollup-build-scripts --dev // 或 npm install @lywzx/rollup-build-scripts --save-dev
```

## 配置

在package.json中，scripts字段，添加如下配置：

```
"dev": "node --max_old_space_size=8192 node_modules/rollup/dist/bin/rollup -c node_modules/@lywzx/rollup-build-scripts/rollup.config.js -w",
"build": "node --max-old-space-size=8192 node_modules/@lywzx/rollup-build-scripts/index.js",
```

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


如果以上参数，还不够功能，可以使用配置文件，创建.rollup.config.js至项目根目录，配置示例：

```typescript
/**
 * @type {import('@lywzx/rollup-build-scripts').IRollupConfig}
 */
module.exports = {
  ts: true,
  dts: true,
  inputPrefix: 'src',
  workspace: ['packages'],
  external: ['demo'],
}
```

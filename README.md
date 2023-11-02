# Eagle-Plugin-PAG-Format-Extension
> Eagle PAG 文件格式扩展插件

## 开发
### 安装依赖
```shell
pnpm i # npm i
```
### 打包编译
测试
```shell
pnpm run build:test # npm run build:test
```
正式
```shell
pnpm run build:prod # npm run build:prod
```
### 项目结构
1. 项目根目录中的文件只是项目开发配置或编译配置。
2. 所有的插件代码、插件配置、资源文件均在`/src/`目录中。
3. 插件核心代码均封装在`/src/core/`目录中，使用`TypeScript`语法及`ES Module`标准进行编写，可以使用`NPM`依赖包。
4. 插件业务代码在`/src/plugin/`目录中（此处的代码文件结构均遵循`Eagle`官方的开发文档标准，关于`Eagle`插件官方提供的标准及文件结构，可以查看 [Eagle Plugin API](https://developer.eagle.cool/plugin-api/v/zh-cn/get-started/anatomy-of-an-extension) ），使用`JavaScript`语法及`CommonJS`标准进行编写，不建议在此处引用`NPM`依赖包，此处的`thumbnail`或`viewer`代码只对页面`DOM`视图进行操作，其它任何操作都封装至`/src/core/`核心代码，通过实例化后调用。
5. 在编译时会先用`Rollup`将`/src/core/`中的代码打包为单独的模块，并且合并为一个单独的`cjs`文件以供`/src/plugin/`中引用（所以要在`/src/core/index.ts`中将所有需要给`/src/plugin/`调用的类或方法导出），之后会使用`Gulp`对`/src/plugin/`中的插件基本业务代码以及资源文件进行压缩合并，输出至`/dist/`文件夹中。

## 调试
* 将本项目打包编译后，在`Eagle`中按`P`键打开插件面板，点击`开发者选项`-`导入本地项目`，选择本插件根目录中编译后的`dist`文件夹路径，在插件列表中将会出现`PAG 图像扩展`。
* 将`.pag`格式的文件导入到`Eagle`中，双击打开即可进行直接预览。
* 如需使用开发工具调试或查看`console`日志，在`Eagle`中单击选中需要调试的`.pag`格式文件，然后按`P`键打开插件面板，点击插件列表中的`PAG 图像扩展`，会在新窗口中出现预览，此时在新窗口中按`F12`键，即可打开`Chrome Dev Tools`开发工具。

## 说明
* 最终编译输出至`/dist/`目录中的文件是可供`Eagle`插件系统本地调试使用的完整文件包。如需发布生成`.eagleplugin`格式的`Eagle 插件包`文件，可先按照 [[调试]](#调试) 中的方式将本地插件导入到`Eagle`中，之后在插件列表中点击`PAG 图像扩展`右侧的`…`，选择`打包插件`即可。
* 关于插件开发或`Eagle`相关问题，可前往 [Eagle 插件开发群](https://discord.gg/eGFYpRx7x4) 进行交流或反馈。
* `PAG(Portable Animated Graphics)`格式是腾讯推出的一种适用于`AE(Adobe After Effects)`导出的动效格式，其采用可扩展的二进制文件格式，可以在文件中集成图片、音频，在编解码速度和文件压缩率都有很优秀的表现。具体可以查阅 [PAG官网](https://pag.art/)。

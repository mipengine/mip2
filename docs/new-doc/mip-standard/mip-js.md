## JS代码规范

### 具体规范
- MIP 项目中 JS 代码统一都遵循 JavaScript Standard Style 规范，且必须通过 ESLint 工具审核之后才能提交，一般不允许使用 eslint-disable 来豁免检测。
- 所有样式文件必须使用UTF-8编码。
- 组件的脚本开发采用ES6和ES Module的编写方式。
- Vue 文件的 template 部分需要遵守 Vue 的编码规范。

尤其是在多方合作的项目开发中，遵守统一的 JS 代码规范，显得尤为重要。

### 2.检验工具

MIP初始化项目中，已经为开发者配置好了 ESLint 校验工具，开发者可以通过简单命令行完成代码的检验及校正工作。项目中 "eslint-config-standard" 作为 ESLint 的规范配置引入, 在  `.eslintrc.json` 的 "extends" 配置项中使用，不需要额外安装 standard 工具，编辑器也不需要安装 standard 插件，只需要安装 ESLint 的代码检查插件即可。
具体的命令行可以参考 `package.json`  文件中 scripts 的配置。

### 2.编辑器校正工具

除此之外，开发者也可以在编辑器中做相应的设置或引入特定的插件，让编辑器去完成部分校正工作，这里列出了部分编辑器及插件供开发者参考：

## 1.Sublime Text
通过 Package Control，安装 SublimeLinter 和 SublimeLinter-contrib-standard。如果想要保存时自动格式化，还需安装StandardFormat。
## 2.Atom
安装linter-js-standard。如果想要保存时自动格式化，还需安装standard-formatter。
安装standardjs-snippets 可以获得snippets特性。
## 3.Visual Studio Code
安装vscode-standardjs（已经包含了自动格式化）。
安装vscode-standardjs-snippets 以获得JS snippets安装vscode-react-standard以获得React snippets。
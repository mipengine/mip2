# 5. 页面校验

MIP 开发工具还提供了页面规范的校验工具，来帮助开发者快速定位不符合规范的地方。

1. 校验页面是否符合 MIP HTML 规范，执行如下命令，结果如图所示：

	``` bash
	$ mip2 validate -p example/index.html
	```

    ![validate0](http://bos.nj.bpc.baidu.com/assets/mip/codelab/validate0.png)

	> 可以看到，出现了校验失败的结果，它提示我们需要将带有 canonical 属性的 link 指向原页面，并且将 mip-example.js 的引用地址替换成线上CDN（前提是已经提交上线了），诸如此类，只需按照提示进行相应的微调即可。


2. 校验组件是否符合组件开发规范，执行如下命令，结果如图所示：

	``` bash
	$ mip2 validate -c ./componets
	```

	![validate1](http://bos.nj.bpc.baidu.com/assets/mip/codelab/validate1.jpg)


3. 代码格式校验，安装依赖，代码必须遵守 JavaScript Standard Style [[CN](https://standardjs.com/rules-zhcn.html)/[EN](https://standardjs.com/rules-en.html)] 规范

	``` bash
	# 安装依赖
	$ npm install
	# 检查代码格式错误
	$ npm run lint
	# 修正代码格式错误
	$ npm run fix
	```

	> 代码规范需通过才能申请合入哦！


如果要继续深入学习自定义组件的开发，开发者可以继续后续的[如何开发自定义组件](../component-development/introduction.md)

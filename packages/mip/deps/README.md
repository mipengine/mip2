# deps 目录说明

deps 目录均为第三方引用的 lib

有些 lib 有一些业务上的修改无法兼容，因此直接将源代码拷贝至此，而非通过 npm 来管理

# esl

目前 esl 只提供了 源码形式的版本

# fetch-jsonp

fetch-jsonp 只提供了 UMD 的版本，造成加载时只会进入 AMD 逻辑，因此需要改成 esm 的形式

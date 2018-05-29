/**
 * @file dev.js
 * @author clark-t (clarktanglei@163.com)
 */

const Server = require('./server');
const cli = require('./cli');
const opn = require('opn');

module.exports = function ({
    dir = process.cwd(),
    port = 8111,
    livereload = false,
    autoopen
}) {
    const server = new Server({port, dir, livereload});

    try {
        server.run();

        cli.info(' ');
        cli.info(' ');
        cli.info('=============================');
        cli.info(`服务启动成功，正在监听 http://127.0.0.1:${server.port}`);
        cli.info(`/example 目录下的 html 可以通过 http://127.0.0.1:${server.port}/example/页面名.html 进行预览。`);
        cli.info(`/components/组件名/test 目录下的 html 可以通过 http://127.0.0.1:${server.port}/components/组件名/example/页面名.html 进行预览。`);
        cli.info(`组件可以通过引入 http://127.0.0.1:${server.port}/组件名/组件名.js 进行调试。`);
        cli.info('=============================');
        cli.info(' ');
        cli.info(' ');

        if (autoopen) {
            if (/^\//.test(autoopen)) {
                autoopen = `http://127.0.0.1:${server.port}${autoopen}`;
            }

            cli.info(`正在打开网页 ${autoopen}`);
            opn(autoopen);
        }
    }
    catch (e) {
        cli.error(e, '服务启动失败');
    }
};

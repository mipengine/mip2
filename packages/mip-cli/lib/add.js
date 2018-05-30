/**
 * @file add mip component
 * @author tracy (qiushidev@gmail.com)
 */

const path = require('path');
const fs = require('fs');
const cli = require('./cli');
const generate = require('./generate');
const downloadRepo = require('./utils/download-repo');
/* eslint-disable */
const {globPify} = require('./utils/helper');
/* eslint-enable */

module.exports = function add(config) {

    if (fs.existsSync(path.resolve('components', config.compName)) && !config.options.force) {
        cli.warn('组件:' + config.compName + ' 已存在，您可以使用 --force 参数强制覆盖');
        return;
    }

    const componentTpl = 'template/components/mip-example';

    downloadRepo(opts => {
        generate(componentTpl, config.compName, async err => {
            if (err) {
                cli.error('Failed to add component: ' + err.message.trim());
                return;
            }

            await replaceComponentName();

            cli.info('Add component: ' + config.compName + ' successfully!');
        });
    });

    function replaceComponentName() {
        return globPify('**/*.*', {
            cwd: path.resolve('components', config.compName),
            realpath: true
        })
        .then(files => {
            files.forEach(file => {
                fs.renameSync(file, file.replace(/(\/)mip-example(\.[html|md|vue])/, '$1' + config.compName + '$2'));
            });
        });
    }
};

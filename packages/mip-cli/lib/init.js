/**
 * @file 初始化mip项目命令
 * @author tracy(qiushidev@gmail.com)
 */

const cli = require('./cli');
const generate = require('./generate');
const downloadRepo = require('./utils/download-repo');

module.exports = function init() {
    downloadRepo(() => {
        generate('template', false, err => {
            if (err) {
                cli.error('Failed to generate project: ' + err.message.trim());
                return;
            }

            cli.info('generate MIP project successfully!');
        });
    });
};


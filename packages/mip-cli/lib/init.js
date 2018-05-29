/**
 * @file 初始化mip项目命令
 * @author tracy(qiushidev@gmail.com)
 */

const cli = require('./cli');
const path = require('path');
const exists = require('fs').existsSync;
const ora = require('ora');
const home = require('user-home');
const rm = require('rimraf').sync;
const download = require('download-git-repo');
const generate = require('./generate');
const OFFICIAL_TEMPLATE = 'mip-project/mip-cli-template';

module.exports = function init() {
    let template = OFFICIAL_TEMPLATE;
    const spinner = ora('正在获取最新模板');
    spinner.start();

    // 本地临时目录
    const tmp = path.join(home, '.mip-template');
    // 先清空临时目录
    if (exists(tmp)) {
        rm(tmp);
    }

    // 下载默认模板到临时目录
    download(template, tmp, {clone: false}, err => {
        spinner.stop();
        if (err) {
            cli.error('Failed to download repo: ' + err.message.trim());
            return;
        }

        generate(tmp, err => {
            if (err) {
                cli.error('Failed to generate project: ' + err.message.trim());
                return;
            }

            cli.info('generate MIP project successfully!');
        });
    });
};


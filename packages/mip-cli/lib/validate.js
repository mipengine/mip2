/**
 * @file MIP 校验
 * @author liwenqian
 */


const cli = require('./cli');
const fs = require('fs');
const path = require('path');
const Validator = require('mip-validator');
const compValidator = require('mip-component-validator');
const pageValidator = new Validator();

module.exports = function validate(config) {
    const baseDir = config.baseDir || process.cwd();
    const filePath = path.join(baseDir, config.filePath);

    if (!fs.existsSync(filePath)) {
        cli.error('path not exist');
    }

    if (config.options.page) {
        let content = fs.readFileSync(filePath, 'utf-8');
        let result = {
            type: 'page',
            errors: pageValidator.validate(content)
        };
        report(result, filePath);
    }
    else {
        compValidator.validate(filePath).then(result => {
            result.type = 'component';
            report(result, filePath);
        }, e => {
            cli.error(filePath, e.message);
        });
    }
};

function report(data, filePath) {
    if (data.type === 'page') {
        cli.info('页面校验结果: ');
    }
    else {
        cli.info('组件校验结果: ');
    }

    if (!data.errors.length || data.status === 0) {
        cli.info('validate success', cli.chalk.green(filePath));
        return;
    }
    let currentFile = '';
    data.errors.map(error => {
        if (currentFile !== error.file) {
            currentFile = error.file;
            cli.info('validate error', cli.chalk.green(error.file || filePath));
        }
        cli.error('line', error.line + ',', 'col', error.col + ':', error.message);
    });
}

/**
 * @file get meta.js config data from template
 * @author tracy(qiushidev@gmail.com)
 */

const path = require('path');
const exists = require('fs').existsSync;
const getGitUser = require('./git');

module.exports = dir => {
    const metajs = path.join(dir, 'meta.js');
    let opts = {};

    if (exists(metajs)) {
        const req = require(path.resolve(metajs));
        if (req !== Object(req)) {
            throw new Error('meta.js needs to expose an object');
        }
        opts = req;
    }

    // 使用输入的项目名称 替换默认值
    // setDefault(opts, 'name', name);

    const author = getGitUser();
    if (author) {
        setDefault(opts, 'author', author);
    }

    return opts;
};

/**
 * Set the default value for a prompt question
 *
 * @param {Object} opts meta 信息
 * @param {string} key 键名
 * @param {string} val 键值
 */
function setDefault(opts, key, val) {
    const prompts = opts.prompts || (opts.prompts = {});
    if (!prompts[key] || typeof prompts[key] !== 'object') {
        prompts[key] = {
            'type': 'string',
            'default': val
        };
    }
    else {
        prompts[key].default = val;
    }
}

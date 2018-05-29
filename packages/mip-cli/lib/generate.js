/**
 * @file 渲染模板生成项目
 * @author tracy(qiushidev@gmail.com)
 */

const async = require('async');
const path = require('path');
const ms = require('metalsmith');
const inquirer = require('inquirer');
const render = require('./utils/render').render;
const getMeta = require('./utils/meta');

module.exports = function generate(src, done) {
    const metalsmith = ms(path.join(src, 'template'));
    const templatePrompts = getMeta(src).prompts;

    metalsmith
        .use(ask(templatePrompts))
        .use(renderTemplateFiles())
        .clean(false)
        .source('.') // start from template root instead of `./src` which is Metalsmith's default for `source`
        .build(err => {
            done(err);
        });
};

function ask(templatePrompts) {
    return (files, metalsmith, done) => {
        async.eachSeries(Object.keys(templatePrompts), run, () => {
            // After all inquirer finished, set destination directory with input project name
            metalsmith.destination(path.resolve('./', metalsmith.metadata().name));
            done();
        });

        function run(key, done) {
            let prompt = templatePrompts[key];

            inquirer.prompt([{
                'type': prompt.type,
                'name': key,
                'message': prompt.message || prompt.label || key,
                'default': prompt.default,
                'validate': prompt.validate || (() => true)
            }]).then(answers => {
                if (typeof answers[key] === 'string') {
                    metalsmith.metadata()[key] = answers[key].replace(/"/g, '\\"');
                }
                else {
                    metalsmith.metadata()[key] = answers[key];
                }
                done();
            }).catch(done);
        }
    };
}

function renderTemplateFiles() {
    return (files, metalsmith, done) => {
        let keys = Object.keys(files);
        async.each(keys, run, done);

        function run(file, done) {
            let str = files[file].contents.toString();

            // do not attempt to render files that do not have mustaches
            if (!/{{([^{}]+)}}/g.test(str)) {
                return done();
            }

            let res;
            try {
                res = render(str, metalsmith.metadata());
            }
            catch (err) {
                return done(err);
            }

            files[file].contents = new Buffer(res);
            done();
        }
    };
}

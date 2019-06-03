/**
 * @file test.js command test
 * @author tracy(qiushidev@gmail.com)
 */

import test from 'ava';
import fs from 'fs';
import path from 'path';
import {existsSync as exists} from 'fs';
import generate from '../lib/generate';
import {render} from '../lib/utils/render';
import inquirer from 'inquirer';
import execa from 'execa';
import {sync as rm} from 'rimraf';
import request from 'request';
import Server from '../lib/server';

const TEMPLATE_OUTPUT_PATH = path.resolve('./test/mock/template-output');
const MOCK_DEFAULT_TEMPLATE_PATH = path.resolve('./test/mock/mock-default-template');

function monkeyPatchInquirer(answers) {
    // monkey patch inquirer
    inquirer.prompt = questions => {
        const key = questions[0].name
        const _answers = {}
        _answers[key] = answers[key]

        return Promise.resolve(_answers)
    }
}

const answers = {
    name: 'mip-cli-test',
    author: 'James (james@email.com)',
    description: 'mip cli test'
};

test.beforeEach('back to test dir', t => {
    process.chdir(__dirname);
});

test.cb('it should generate template correctly', t => {

    monkeyPatchInquirer(answers);

    generate('test', MOCK_DEFAULT_TEMPLATE_PATH, TEMPLATE_OUTPUT_PATH, err => {
        if (err) {
            t.fail(err);
        }

        // 文件是否生成
        t.is(exists(`${TEMPLATE_OUTPUT_PATH}/components/mip-example/mip-example.vue`), true);
        t.is(exists(`${TEMPLATE_OUTPUT_PATH}/components/mip-example/mip-example.md`), true);
        t.is(exists(`${TEMPLATE_OUTPUT_PATH}/package.json`), true);

        // render 结果是否一致
        const generatedFile = fs.readFileSync(`${TEMPLATE_OUTPUT_PATH}/package.json`, 'utf8');
        const res = render(fs.readFileSync(`${MOCK_DEFAULT_TEMPLATE_PATH}/template/package.json`, 'utf8'), answers);
        t.is(generatedFile, res);
        t.end();
        rm(TEMPLATE_OUTPUT_PATH);
    });
});

test('it should build components correctly', async t => {
    const buildCmd = path.join(__dirname, '../bin/mip2-build');

    process.chdir(path.join(__dirname, 'mock/mock-mip-project'));
    await execa(buildCmd);

    let files = fs.readdirSync(path.join(__dirname, 'mock/mock-mip-project/dist'));

    t.is(files.length, 2);
    t.deepEqual(files, ['mip-example-1.js', 'mip-example-2.js']);
    rm(path.join(__dirname, 'mock/mock-mip-project/dist'));
});

test('it should start dev server correctly', async t => {
    const dir = path.join(__dirname, 'mock/mock-mip-project');

    const server = new Server({
        port: 8111,
        dir,
        livereload: false
    });

    server.run();

    let res = await new Promise((resolve, reject) => {
        request({
            url: 'http://127.0.0.1:8111/test',
            timeout: 1000
        }, (err, res, body) => {
            if (!err && res.statusCode === 200) {
                resolve(res.body);
            }
            else {
                reject(err);
            }
        });
    });

    let expectHtml = fs.readFileSync(path.join(dir, 'test/index.html'), 'utf8');
    t.is(res, expectHtml);
});

test('it should run validate correctly', async t => {
    const validateCmd = path.join(__dirname, '../bin/mip2-validate');

    let res = await execa(validateCmd, ['mock/mock-mip-project']);

    t.truthy(res);
    t.is(res.code, 0);
    t.is(res.stderr, '');
});


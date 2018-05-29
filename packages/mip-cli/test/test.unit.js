/**
 * @file test.js unit test
 * @author tracy(qiushidev@gmail.com)
 */

import test from 'ava';
import fs from 'fs';
import path from 'path';
import meta from '../lib/utils/meta';
import {render} from '../lib/utils/render';

test('it should read and modify meta.js correctly', t => {
    const mockDir = path.join(__dirname, 'mock/mock-default-template');
    let options = meta('testInputProjectName', mockDir);
    t.truthy(options);
    t.truthy(options.prompts);
    t.is(typeof options.prompts.name, 'object');
    t.is(typeof options.prompts.description, 'object');
    t.is(typeof options.prompts.author, 'object');
    t.is(options.prompts.name.default, 'testInputProjectName');
});

test('it should render file correctly',  t => {
    const template = '<div>this is {{name}}</div>';
    let res = render(template, {name: 'test'});

    t.is(res, '<div>this is test</div>');
});

// TODO ...



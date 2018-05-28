/**
 * @file index.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

import {baseOptions} from './options';
import {createCompiler} from 'compiler/index';

const {compile, compileToFunctions} = createCompiler(baseOptions);

export {compile, compileToFunctions};

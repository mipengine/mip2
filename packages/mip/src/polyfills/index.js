/**
 * @file polyfill entry
 * @author sekiyika(pengxing@baidu.com)
 */

'use strict';

import {install as installArrayIncludes} from './array-includes';
// import {install as installDOMTokenListToggle} from './domtokenlist-toggle';
// import {install as installDocContains} from './document-contains';
// import {install as installMathSign} from './math-sign';
import {install as installObjectAssign} from './object-assign';
import {install as installPromise} from './promise';
import {install as installBabelRuntimeHelpers} from './babel-runtime-helpers';

installArrayIncludes(self);
// installDOMTokenListToggle(self);
// installDocContains(self);
// installMathSign(self);
installObjectAssign(self);
installPromise(self);
installBabelRuntimeHelpers(self);

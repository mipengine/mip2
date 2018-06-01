/**
 * @file index.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

import on from './on'
import bind from './bind'
import {noop} from 'shared/util'

export default {
  on,
  bind,
  cloak: noop
}

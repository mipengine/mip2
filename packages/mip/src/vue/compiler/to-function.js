/**
 * @file to-function.js
 * @author sfe-sy(sfe-sy@baidu.com)
 */

/* eslint-disable no-new, no-new-func */

import {noop, extend} from 'shared/util'
import {warn as baseWarn, tip} from 'core/util/debug'

function createFunction (code, errors) {
  try {
    return new Function(code)
  } catch (err) {
    errors.push({err, code})
    return noop
  }
}

export function createCompileToFunctionFn (compile) {
  const cache = Object.create(null)

  return function compileToFunctions (template, options, vm) {
    options = extend({}, options)
    const warn = options.warn || baseWarn
    delete options.warn

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production') {
      // detect possible CSP restriction
      try {
        new Function('return 1')
      } catch (e) {
        if (e.toString().match(/unsafe-eval|CSP/)) {
          warn(
            'It seems you are using the standalone build of Vue.js in an ' +
                        'environment with Content Security Policy that prohibits unsafe-eval. ' +
                        'The template compiler cannot work in this environment. Consider ' +
                        'relaxing the policy to allow unsafe-eval or pre-compiling your ' +
                        'templates into render functions.'
          )
        }
      }
    }

    // check cache
    const key = options.delimiters
      ? String(options.delimiters) + template
      : template
    if (cache[key]) {
      return cache[key]
    }

    // compile
    const compiled = compile(template, options)

    // check compilation errors/tips
    if (process.env.NODE_ENV !== 'production') {
      if (compiled.errors && compiled.errors.length) {
        warn(
          `Error compiling template:\n${template}` +
                    compiled.errors.map(e => `- ${e}`).join('\n') + '\n',
          vm
        )
      }

      if (compiled.tips && compiled.tips.length) {
        compiled.tips.forEach(msg => tip(msg, vm))
      }
    }

    // turn code into functions
    const fnGenErrors = []
    const res = {
      render: createFunction(compiled.render, fnGenErrors),
      staticRenderFns: compiled.staticRenderFns.map(code => createFunction(code, fnGenErrors))
    }

    // check function generation errors.
    // this should only happen if there is a bug in the compiler itself.
    // mostly for codegen development use

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production') {
      if ((!compiled.errors || !compiled.errors.length) && fnGenErrors.length) {
        warn(
          'Failed to generate render function:\n' +
                    fnGenErrors.map(({err, code}) => `${err.toString()} in\n${code}`).join('\n'),
          vm
        )
      }
    }

    return (cache[key] = res)
  }
}

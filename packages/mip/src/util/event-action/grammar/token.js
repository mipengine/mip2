/**
 * @file token.js
 * @author clark-t (clarktanglei@163.com)
 */
import {
  regexp,
  text
} from '../../parser/lexer'

export const _ = regexp('^\\s*')
export const $question = text('?')
export const $colon = text(':')
export const $comma = text(',')
export const $semi = text(';')
export const $dot = text('.')
// export const $or = text('||')
// export const $and = text('&&')
export const $leftBrace = text('{')
export const $rightBrace = text('}')
export const $leftBracket = text('[')
export const $rightBracket = text(']')
export const $leftParen = text('(')
export const $rightParen = text(')')


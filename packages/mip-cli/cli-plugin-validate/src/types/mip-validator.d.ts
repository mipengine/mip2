declare module 'mip-validator' {
  type Rules = Record<string, string | any>

  interface Options {
    fastMode?: boolean;
    rules?: Rules;
    type: string;
  }

  export default class {
    constructor (rules?: Rules);
    validate (html: string, options?: Options): Error[];
  }
}

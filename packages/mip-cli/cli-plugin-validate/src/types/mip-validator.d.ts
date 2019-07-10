declare module 'mip-validator' {
  type Rules = Record<string, string | any>

  interface Options {
    fastMode?: boolean;
    rules?: Rules;
    type: string;
  }

  export default class {
    public constructor (rules?: Rules);
    public validate (html: string, options?: Options): Error[];
  }
}

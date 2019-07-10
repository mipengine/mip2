declare module 'mip-component-validator' {
  interface WarnOrError {
    file?: string;
    message?: string;
    line?: number;
    col?: number;
  }

  export interface Report {
    type?: string;
    status?: number;
    warns?: WarnOrError[];
    errors?: WarnOrError[];
  }

  interface Options {
    ignore?: RegExp[];
  }

  export function validate (path: string, options?: Options): Report;
  export function whitelist (path: string): Report
}

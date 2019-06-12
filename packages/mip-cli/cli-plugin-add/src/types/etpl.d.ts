declare module 'etpl' {
  export interface Options {
    commandOpen?: string;
    commandClose?: string;
    variableOpen?: string;
    variableClose?: string;
  }

  type renderFunc = (data: object) => string

  export class Engine {
    public constructor (options: Options);
    public compile (source: string): renderFunc;
  }
}

declare module 'etpl' {
  interface Options {
    commandOpen?: string;
    commandClose?: string;
    variableOpen?: string;
    variableClose?: string;
  }

  function render (name: string, data: object): string

  // interface EngineImpl {
  //   compile: (source: string) => typeof render;
  // }

  class Engine {
    constructor (options: Options);
    private options: Options;
    compile (source: string): (data: object) => string;
  }
  // interface Engine {
  //   new (options: Options): EngineImpl;
  // }
}

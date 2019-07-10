declare module 'workbox-build' {
  type Config = Record<string, string | any>

  export interface SWResult {
    swString: string;
  }

  export function generateSWString(config: Config): Promise<SWResult>;
}

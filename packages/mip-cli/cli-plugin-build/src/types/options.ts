/**
 * @file options.ts
 * @author clark-t (clarktanglei@163.com)
 */
export interface BuilderOptions {
  publicPath: string;
  context: string;
  outputPath: string;
  cleanDist: boolean;
  ignoreWhitelistCheck: string;
  env: string;
}

export interface ConfigOptions extends BuilderOptions {
  entry: Record<string, string>;
}


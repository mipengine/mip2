/**
 * @file plugin.ts
 * @author clark-t (clarktanglei@163.com)
 */

import {
  SyncHook,
  SyncBailHook,
  SyncWaterfallHook,
  SyncLoopHook,
  AsyncParallelHook,
  AsyncParallelBailHook,
  AsyncSeriesHook,
  AsyncSeriesBailHook,
  AsyncSeriesWaterfallHook
} from 'tapable'

export interface Option {
  flags: string;
  description: string;
  fn?: ((...args: any[]) => any) | RegExp;
  defaultValue?: any;
}

export interface Command {
  description: string;
  options: Option[];
  help?: string;
}

export type Hook = SyncHook |
  SyncBailHook |
  SyncWaterfallHook |
  SyncLoopHook |
  AsyncParallelHook |
  AsyncParallelBailHook |
  AsyncSeriesHook |
  AsyncSeriesBailHook |
  AsyncSeriesWaterfallHook


export interface Plugin {
  command: Command;
  run<T extends {}>(args: T): void;
  hooks?: Record<string, Hook>;
}


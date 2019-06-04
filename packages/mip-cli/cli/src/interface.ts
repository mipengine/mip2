/**
 * Value type of arguments.
 */
export type Value = number | string | boolean | (number | string | boolean)[];

/**
 * An object representing parsed arguments from the command line.
 */
export interface Arguments {
  [argName: string]: Value | undefined;
}

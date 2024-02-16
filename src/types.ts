import * as ts from 'typescript';

export interface Options {
  tsconfigPath?: string;

  /**
   * TypeScript CompilerOptions
   * CompilerOptions are ignored if tsconfigPath is defined
   */
  compilerOptions?: ts.CompilerOptions;
}

export interface Source {
  /**
   * The absolute path to where the files are located.
   */
  root: string;

  /**
   * Match files using the patterns the shell uses, like stars and stuff. It
   * uses Glob package.
   */
  pattern: string;

  /**
   * Pattern to ignore.
   */
  ignore?: string[];

  /**
   * The options
   */
  options?: Options;
}

export interface DocumentationTag {
  name: string;
  value: string;
}

export interface DocumentationComment {
  description: string;
  tags: Record<string, DocumentationTag>;
}

export interface Property extends DocumentationComment {
  identifier: string;
  type: PropertyType;
  isRequired: boolean;
  isInternal: boolean;
  defaultValue?: string;
}

export interface ElementProperty {
  identifier: string;
  type: PropertyType;
  description: string;
  url: string;
}

export interface PropertyType {
  type: string;
  raw?: string;
  items?: string[] | Property[];
}

export interface ComponentDoc extends DocumentationComment {
  package: string;
  module: string;
  name: string;
  fileName: string;
  Args: Property[];
  Blocks: Property[];
  Element: ElementProperty | undefined;
}

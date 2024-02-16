import path from 'path';
import glob from 'fast-glob';
import * as ts from 'typescript';
import Parser from './parser';
import { getCompilerOptionsFromTSConfig, sortArgs } from './utils';
import {
  Options,
  Source,
  ComponentDoc,
  Property,
  PropertyType,
  ElementProperty
} from './types';

const DEFAULT_IGNORE = [
  '/**/node_modules/**',
  '/**/.git/**',
  '/**/dist/**',
  'node_modules/**',
  '.git/**',
  'dist/**'
];

export function parse(sources: Source[]): ComponentDoc[] {
  const components: ComponentDoc[] = [];

  sources.forEach((source) => {
    const filePaths: string[] = [];
    const result = glob.sync(source.pattern, {
      cwd: source.root,
      ignore: [...DEFAULT_IGNORE, ...(source.ignore || [])],
      absolute: true
    });
    filePaths.push(...result);

    let compilerOptions =
      (source.options || ({} as Options)).compilerOptions || {};

    if (source.options && source.options.tsconfigPath) {
      compilerOptions = getCompilerOptionsFromTSConfig(
        source.options.tsconfigPath,
        source.root
      );
    }

    const program = ts.createProgram(filePaths, compilerOptions);
    const checker = program.getTypeChecker();
    const parser = new Parser(checker);

    const maybeComponents: ts.ClassDeclaration[] = [];

    filePaths
      .map((filePath) => program.getSourceFile(filePath))
      .filter(
        (sourceFile): sourceFile is ts.SourceFile =>
          typeof sourceFile !== 'undefined'
      )
      .forEach((sourceFile) => {
        sourceFile.statements.forEach((stmt) => {
          if (ts.isClassDeclaration(stmt)) {
            maybeComponents.push(stmt);
          }
        });
      });

    components.push(
      ...maybeComponents
        .filter(
          (declaration) => declaration.name && parser.isComponent(declaration)
        )
        .map((component) => parser.getComponentDoc(component))
        .map((component) => {
          return {
            ...component,
            Args: sortArgs(component.Args),
            fileName: component.fileName.replace(
              path.join(source.root, '/'),
              ''
            )
          };
        })
    );
  });

  return components;
}

export type {
  Options,
  Source,
  ComponentDoc,
  Property,
  PropertyType,
  ElementProperty
};
export default { parse };

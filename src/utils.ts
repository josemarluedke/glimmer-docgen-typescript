import fs from 'fs';
import path from 'path';
import { ArgumentItem } from './types';
import * as ts from 'typescript';

export function sortArgs(args: ArgumentItem[]): ArgumentItem[] {
  return args.sort((a, b) => {
    const nameA = a.name.toUpperCase();
    const nameB = b.name.toUpperCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    return 0;
  });
}

export function getCompilerOptionsFromTSConfig(
  tsconfigPath: string,
  sourceRoot: string
): ts.CompilerOptions {
  if (!path.isAbsolute(tsconfigPath)) {
    tsconfigPath = path.join(sourceRoot, tsconfigPath);
  }

  const basePath = path.dirname(tsconfigPath);
  const { config, error } = ts.readConfigFile(tsconfigPath, (filename) =>
    fs.readFileSync(filename, 'utf8')
  );

  if (error !== undefined) {
    const errorText = `Cannot load custom tsconfig.json from provided path: ${tsconfigPath}, with error code: ${error.code}, message: ${error.messageText}`;
    throw new Error(errorText);
  }

  const { options, errors } = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    basePath,
    {},
    tsconfigPath
  );

  if (errors && errors.length) {
    throw errors[0];
  }
  return options;
}

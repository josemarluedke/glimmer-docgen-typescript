import * as ts from 'typescript';
import {
  DocumentationTag,
  DocumentationComment,
  ArgumentItem,
  ArgumentItemType,
  ComponentDoc
} from './types';

export default class Parser {
  checker: ts.TypeChecker;

  constructor(checker: ts.TypeChecker) {
    this.checker = checker;
  }

  getComponentDoc(component: ts.ClassDeclaration): ComponentDoc {
    const type = this.checker.getTypeAtLocation(component);
    const output: ComponentDoc = {
      name: component.name?.getText() || 'Component',
      fileName: component.getSourceFile().fileName,
      args: this.getComponentArgs(component),
      ...this.getDocumentationFromSymbol(type.symbol)
    };

    return output;
  }

  getComponentArgs(component: ts.ClassDeclaration): ArgumentItem[] {
    const componentType = this.checker.getTypeAtLocation(component);
    const argsProperty = componentType.getProperty('args');

    if (argsProperty) {
      const args = this.checker
        .getTypeOfSymbolAtLocation(argsProperty, component)
        .getApparentProperties();

      return args.map((arg) => {
        const type = this.checker.getTypeOfSymbolAtLocation(arg, component);

        const { description, tags } = this.getDocumentationFromSymbol(arg);

        return {
          name: arg.getName(),
          type: this.getArgumentType(type),
          isRequired: this.isRequired(arg),
          description,
          tags,
          defaultValue: tags.defaultValue ? tags.defaultValue.value : undefined
        };
      });
    }

    return [];
  }

  getArgumentType(argumentType: ts.Type): ArgumentItemType {
    const typeAsString = this.checker.typeToString(argumentType);

    if (argumentType.isUnion() && typeAsString !== 'boolean') {
      return {
        name: 'enum',
        raw: typeAsString,
        options: argumentType.types.map((type) =>
          this.getValuesFromUnionType(type)
        )
      };
    }

    return { name: typeAsString };
  }

  getValuesFromUnionType(type: ts.Type): string {
    if (type.isStringLiteral()) return `'${type.value}'`;
    if (type.isNumberLiteral()) return `${type.value}`;
    return this.checker.typeToString(type);
  }

  isRequired(symbol: ts.Symbol): boolean {
    const isOptional = (symbol.getFlags() & ts.SymbolFlags.Optional) !== 0;

    const hasQuestionToken = symbol.declarations.every((d) => {
      if (ts.isPropertySignature(d) || ts.isPropertyDeclaration(d)) {
        return d.questionToken;
      }
      return false;
    });

    return !isOptional && !hasQuestionToken;
  }

  // We consider a component a class declaration that has "args" property
  isComponent(component: ts.ClassDeclaration): boolean {
    const componentType = this.checker.getTypeAtLocation(component);

    return !!componentType.getProperty('args');
  }

  getDocumentationFromSymbol(symbol: ts.Symbol): DocumentationComment {
    let description = ts.displayPartsToString(
      symbol.getDocumentationComment(this.checker)
    );

    if (description) {
      description = description.replace('\r\n', '\n');
    }

    const tags = symbol.getJsDocTags();
    const tagMap: Record<string, DocumentationTag> = {};

    tags.forEach((tag) => {
      const trimmedText = (tag.text || '').trim();

      if (tagMap[tag.name]) {
        tagMap[tag.name].value += '\n' + trimmedText;
      } else {
        tagMap[tag.name] = {
          name: tag.name,
          value: trimmedText
        };
      }
    });

    return {
      description,
      tags: tagMap
    };
  }
}

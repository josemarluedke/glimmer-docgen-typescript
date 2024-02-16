import * as ts from 'typescript';
import {
  DocumentationTag,
  DocumentationComment,
  Property,
  PropertyType,
  ComponentDoc,
  ElementProperty
} from './types';

export default class Parser {
  checker: ts.TypeChecker;

  constructor(checker: ts.TypeChecker) {
    this.checker = checker;
  }

  getComponentDoc(component: ts.ClassDeclaration): ComponentDoc {
    const type = this.checker.getTypeAtLocation(component);
    const signature = this.getComponentSignature(component);
    const fileName = component.getSourceFile().fileName;

    const output: ComponentDoc = {
      ...extractPackageAndComponent(fileName),
      name: component.name?.getText() || 'Component',
      fileName: fileName,
      Args: this.getSignatureArgs(signature, component),
      Blocks: this.getSignatureBlocks(signature, component),
      Element: this.getSignatureElement(signature, component),
      ...this.getDocumentationFromSymbol(type.symbol)
    };

    return output;
  }

  getComponentSignature(component: ts.ClassDeclaration): ts.Type | undefined {
    const signature = this.extractTypeParameterFromClass(component);

    if (signature) {
      return this.checker.getTypeAtLocation(signature);
    }
  }

  getSignatureElement(
    signature: ts.Type | undefined,
    node: ts.Node
  ): ElementProperty | undefined {
    if (!signature) {
      return undefined;
    }
    const property = signature?.getProperty('Element');

    if (!property) {
      return undefined;
    }
    const type = this.checker.getTypeOfSymbolAtLocation(property, node);
    const { description } = this.getDocumentationFromSymbol(property);
    const typeDoc = this.getPropertyType(property, type, node);

    return {
      identifier: property.getName(),
      type: typeDoc,
      description,
      url: mdnElementURL(typeDoc.type)
    };
  }

  getSignatureArgs(signature: ts.Type | undefined, node: ts.Node): Property[] {
    if (!signature) {
      return [];
    }
    const property = signature.getProperty('Args');

    if (property) {
      const args = this.checker
        .getTypeOfSymbolAtLocation(property, node)
        .getApparentProperties();
      return this.getPropertiesFromSymbols(args, node);
    }

    return [];
  }

  getSignatureBlocks(
    signature: ts.Type | undefined,
    node: ts.Node
  ): Property[] {
    if (!signature) {
      return [];
    }
    const property = signature.getProperty('Blocks');

    if (property) {
      const propertyType = this.checker.getTypeOfSymbolAtLocation(
        property,
        node
      );
      const symbols = propertyType.getApparentProperties();
      return this.getPropertiesFromSymbols(symbols, node);
    }

    return [];
  }

  getPropertiesFromSymbols(
    symbols: ts.Symbol[],
    parentNode: ts.Node
  ): Property[] {
    return symbols.map((symbol) => {
      const type = this.checker.getTypeOfSymbol(symbol);
      const { description, tags } = this.getDocumentationFromSymbol(symbol);

      return {
        identifier: symbol.getName(),
        type: this.getPropertyType(symbol, type, parentNode),
        isRequired: this.isRequired(symbol),
        isInternal: this.isInternal(tags),
        description,
        tags,
        defaultValue: tags.defaultValue ? tags.defaultValue.value : undefined
      };
    });
  }

  getPropertiesFromType(
    index: number,
    type: ts.Type,
    parentNode: ts.Node
  ): Property {
    const symbol = type.getSymbol();
    if (symbol) {
      const { description, tags } = this.getDocumentationFromSymbol(symbol);

      return {
        identifier: index.toString(),
        type: this.getPropertyType(symbol, type, parentNode),
        isRequired: this.isRequired(symbol),
        isInternal: this.isInternal(tags),
        description,
        tags
      };
    }
    return {
      identifier: index.toString(),
      type: this.getPropertyType(undefined, type, parentNode),
      isRequired: false,
      isInternal: false,
      description: '',
      tags: {}
    };
  }

  extractTypeParameterFromClass(
    classDeclaration: ts.ClassDeclaration
  ): ts.TypeNode | undefined {
    const heritageClause = classDeclaration.heritageClauses?.[0];
    if (!heritageClause) {
      return undefined;
    }

    const baseTypeNode = heritageClause.types[0];
    if (baseTypeNode.typeArguments?.length) {
      const typeArgument = baseTypeNode.typeArguments?.[0];

      return typeArgument;
    }

    const baseType = this.checker.getTypeAtLocation(baseTypeNode);

    // If the base class is not Component, recursively check the base class
    if (baseType.symbol && baseType.symbol.valueDeclaration) {
      const baseClassDeclaration = baseType.symbol
        .valueDeclaration as ts.ClassDeclaration;
      return this.extractTypeParameterFromClass(baseClassDeclaration);
    }

    return undefined;
  }

  getPropertyType(
    symbol: ts.Symbol | undefined,
    type: ts.Type,
    parentNode: ts.Node
  ): PropertyType {
    const typeAsString = this.checker.typeToString(type);
    if (this.isInvokableType(type)) {
      return {
        type: 'function',
        raw: typeAsString
      };
    }

    if (this.isArrayType(type) && this.checker.isTupleType(type)) {
      const elements: ts.Type[] = this.checker
        .getTypeArguments(type as ts.TypeReference)
        .map((type) => type);

      return {
        type: 'Array',
        raw: typeAsString,
        items: elements.map((type, index) => {
          return this.getPropertiesFromType(index, type, parentNode);
        })
      };
    }

    if (type.isUnion() && typeAsString !== 'boolean') {
      return {
        type: 'enum',
        raw: typeAsString,
        items: type.types.map((v) => this.getValuesFromUnionType(v))
      };
    }

    if (this.isArrayType(type)) {
      return {
        type: 'Array',
        raw: typeAsString
      };
    }

    if (
      symbol &&
      this.isInterfaceOrObjectWithOptionalProperties(symbol, type) &&
      !/Element$/.test(symbol.getName())
    ) {
      const props = type.getApparentProperties();
      return {
        type: 'Object',
        items: this.getPropertiesFromSymbols(props, parentNode)
      };
    }

    return {
      type: typeAsString
    };
  }

  isInvokableType(type: ts.Type): boolean {
    // Check if the type has call signatures
    return (
      this.checker.getSignaturesOfType(type, ts.SignatureKind.Call).length > 0
    );
  }

  isArrayType(type: ts.Type): boolean {
    const typeName = this.checker.typeToString(type);

    if (typeName === 'string') {
      return false;
    }

    const kind = this.checker.getIndexTypeOfType(type, ts.IndexKind.Number);
    // Check if the type has a numeric index signature
    return !!kind;
  }

  getValuesFromUnionType(type: ts.Type): string {
    if (type.isStringLiteral()) return `'${type.value}'`;
    if (type.isNumberLiteral()) return `${type.value}`;
    return this.checker.typeToString(type);
  }

  isRequired(symbol: ts.Symbol): boolean {
    const isOptional = (symbol.getFlags() & ts.SymbolFlags.Optional) !== 0;

    const hasQuestionToken = symbol.declarations?.every((d) => {
      if (ts.isPropertySignature(d) || ts.isPropertyDeclaration(d)) {
        return d.questionToken;
      }
      return false;
    });

    return !isOptional && !hasQuestionToken;
  }

  isInternal(tags: DocumentationComment['tags']): boolean {
    if (tags['internal']) {
      return true;
    }

    return false;
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
      let text = '';
      // fallback for typescript < 4.3
      if (typeof tag.text == 'string') {
        text = tag.text;
      } else if (typeof tag.text === 'object') {
        text = tag.text.map((v) => v.text).join(' ');
      }

      const trimmedText = text.trim();

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

  isInterfaceOrObjectWithOptionalProperties(
    symbol: ts.Symbol,
    type: ts.Type,
    shallow = false
  ): boolean {
    const declarations = symbol.declarations;
    if (!declarations || declarations.length === 0) {
      return false;
    }

    const declaration = declarations[0];
    if (!declaration) {
      return false;
    }

    if (ts.isInterfaceDeclaration(declaration)) {
      return true;
    }

    if (ts.isTypeLiteralNode(declaration)) {
      return declaration.members.some((member) =>
        ts.isPropertySignature(member)
      );
    }

    const typeSymbol = type.getSymbol();
    if (!shallow && typeSymbol) {
      const val = this.isInterfaceOrObjectWithOptionalProperties(
        typeSymbol,
        type,
        true
      );
      return val;
    }
    return false;
  }
}

function extractPackageAndComponent(filePath: string): {
  package: string;
  module: string;
} {
  // Match the pattern 'packages/<packageName>/declarations/components/<componentName>.d.ts'
  const packagesMatch = filePath.match(
    /packages\/([^/]+)\/declarations\/components\/([^/]+)(?:\/index)?\.d\.ts$/
  );
  if (packagesMatch) {
    const [, packageName, componentName] = packagesMatch;
    return { package: packageName, module: componentName.replace('.d', '') };
  }

  // Check if the file path is just a component name with extension
  const componentMatch = filePath.match(/([^/]+)\.(d\.ts|gts|js|ts)$/);
  if (componentMatch) {
    const [, componentName] = componentMatch;
    return { package: 'unknown', module: componentName.replace('.d', '') };
  }

  // Match the pattern 'components/<componentName>.d.gts'
  const componentsMatch = filePath.match(
    /(?:[^/]+\/)*components\/([^/]+)\.(d\.ts|gts|js|ts)$/
  );
  if (componentsMatch) {
    const [, componentName] = componentsMatch;
    return { package: 'unknown', module: componentName.replace('.d', '') };
  }

  return { package: 'unknown', module: '' };
}

const mdnElementURL = (typeName: string): string => {
  return `https://developer.mozilla.org/en-US/docs/Web/API/${typeName}`;
};

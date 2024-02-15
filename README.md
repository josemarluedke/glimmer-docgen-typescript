# glimmer-docgen-typescript

Extract information from Glimmer components to generate documentation using typescript parser/checker.

- It works with signature interface (Args, Blocks, Element);
- It works with Glint and `gts` files;


## Compatibility

* Node.js v20 or above
* TypeScript v5.0 or above

## Installation

```sh
npm install --save-dev glimmer-docgen-typescript
# or
yarn add -D glimmer-docgen-typescript
```

## Usage

```js
const docgen = require('glimmer-docgen-typescript');
const fs = require('fs');

const components = docgen.parse([
  {
    root: __dirname,
    pattern: '**/*.ts'
  }
]);

fs.writeFileSync('output.json', JSON.stringify(components));
```

### Options

You can customize the TypeScript parser using the `compilerOptions` object or pass
the path to the `tsconfig.json`.

> Each source can have it's own compiler options.

```js
const docgen = require('glimmer-docgen-typescript');
const path = require('path');

docgen.parse([
  {
    root: __dirname,
    pattern: '**/*.ts',
    options: {
      compilerOptions: {
        allowJs: true
        // ....
      }
    }
  }
]);

// or using tsconfig.json

docgen.parse([
  {
    root: __dirname,
    pattern: '**/*.ts',
    options: {
      tsconfigPath: path.join(__dirname, 'tsconfig.json')
    }
  }
]);

// Glint

docgen.parse([
  {
    root: __dirname,
    pattern: 'declarations/components/**/*.d.ts',
    options: {
      compilerOptions: {
        allowJs: true
        // ....
      }
    }
  }
]);
```

## Example


### Input

Here is a component definition:

```ts
import Component from '@glimmer/component';

interface DrawerArgs {
  /** If the Drawer is open */
  isOpen: boolean;

  /** This called when Drawer should be closed */
  onClose: (event: Event) => void;

  /**
   * If set to false, closing will be prevented
   *
   * @defaultValue true
   */
  allowClosing?: boolean;

  /**
   * The Drawer can appear from any side of the screen. The 'placement'
   * option allows to choose where it appears from.
   *
   * @defaultValue `right`
   */
  placement?: 'top' | 'bottom' | 'left' | 'right';

  /**
   * The Drawer size.
   *
   * @defaultValue `md`
   */
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

interface DrawerSignature {
  Args: DrawerArgs;
  Blocks: {
    default: [{ header: unkown, body: unkown, footer: unkown }]
  };
  Element: HTMLDivElement;
}

/**
 * The component description here
 *
 * @since 1.0.0
 */
export default class Drawer extends Component<DrawerSignature> {}
```

### Output

Here is the output:

```js
[
  {
    package: 'unknown',
    module: 'drawer',
    name: 'Drawer',
    fileName: 'drawer.ts',
    Args: [
      {
        identifier: 'isOpen',
        type: { type: 'boolean' },
        isRequired: true,
        isInternal: false,
        description: 'If the Drawer is open',
        tags: {},
        defaultValue: undefined
      },
      {
        identifier: 'onClose',
        type: { type: '(event: Event) => void' },
        isRequired: true,
        isInternal: false,
        description: 'This called when Drawer should be closed',
        tags: {},
        defaultValue: undefined
      },
      {
        identifier: 'size',
        type: {
          type: 'enum',
          raw: '"xs" | "sm" | "md" | "lg" | "xl" | "full"',
          items: [ "'xs'", "'sm'", "'md'", "'lg'", "'xl'", "'full'" ]
        },
        isRequired: true,
        isInternal: false,
        description: 'The Drawer size.',
        tags: { defaultValue: { name: 'defaultValue', value: '`md`' } },
        defaultValue: '`md`'
      },
      {
        identifier: 'allowClosing',
        type: { type: 'boolean' },
        isRequired: false,
        isInternal: false,
        description: 'If set to false, closing will be prevented',
        tags: { defaultValue: { name: 'defaultValue', value: 'true' } },
        defaultValue: 'true'
      },
      {
        identifier: 'placement',
        type: {
          type: 'enum',
          raw: '"top" | "bottom" | "left" | "right"',
          items: [ "'top'", "'bottom'", "'left'", "'right'" ]
        },
        isRequired: false,
        isInternal: false,
        description: "The Drawer can appear from any side of the screen. The 'placement'\n" +
          'option allows to choose where it appears from.',
        tags: { defaultValue: { name: 'defaultValue', value: '`right`' } },
        defaultValue: '`right`'
      }
    ],
    Blocks: [
      {
        identifier: 'default',
        type: {
          type: 'Array',
          raw: '[{ header: unknown; body: unknown; footer: unknown; }]',
          items: [
            {
              identifier: '0',
              type: {
                type: 'Object',
                items: [
                  {
                    identifier: 'header',
                    type: { type: 'unknown' },
                    isRequired: true,
                    isInternal: false,
                    description: '',
                    tags: {},
                    defaultValue: undefined
                  },
                  {
                    identifier: 'body',
                    type: { type: 'unknown' },
                    isRequired: true,
                    isInternal: false,
                    description: '',
                    tags: {},
                    defaultValue: undefined
                  },
                  {
                    identifier: 'footer',
                    type: { type: 'unknown' },
                    isRequired: true,
                    isInternal: false,
                    description: '',
                    tags: {},
                    defaultValue: undefined
                  }
                ]
              },
              isRequired: true,
              isInternal: false,
              description: '',
              tags: {}
            }
          ]
        },
        isRequired: true,
        isInternal: false,
        description: '',
        tags: {},
        defaultValue: undefined
      }
    ],
    Element: {
      identifier: 'Element',
      type: { type: 'HTMLDivElement' },
      description: '',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/HTMLDivElement'
    },
    description: 'The component description here',
    tags: { since: { name: 'since', value: '1.0.0' } }
  }
]
```

This information can be used to create an interface similar to what you can see below:

![UI Example](https://user-images.githubusercontent.com/230476/103157421-767c6700-4767-11eb-833b-fb77e48bf60d.png)

## Thanks

Inspired by [react-docgen-typescript](https://github.com/styleguidist/react-docgen-typescript).

## License

This project is licensed under the [MIT License](LICENSE.md).

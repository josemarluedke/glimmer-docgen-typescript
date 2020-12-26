# glimmer-docgen-typescript


## Compatibility

* Node.js v10 or above
* TypeScript v4.0 or above

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

/**
 * The component description here
 *
 * @since 1.0.0
 */
export default class Drawer extends Component<DrawerArgs> {}
```

### Output

Here is the output:

```json
[
  {
    "name": "Drawer",
    "fileName": "app/components/drawer.ts",
    "args": [
      {
        "name": "allowClosing",
        "type": {
          "name": "boolean"
        },
        "isRequired": false,
        "description": "If set to false, closing will be prevented",
        "tags": {
          "defaultValue": {
            "name": "defaultValue",
            "value": "true"
          }
        },
        "defaultValue": "true"
      },
      {
        "name": "isOpen",
        "type": {
          "name": "boolean"
        },
        "isRequired": true,
        "description": "If the Drawer is open",
        "tags": {}
      },
      {
        "name": "onClose",
        "type": {
          "name": "(event: Event) => void"
        },
        "isRequired": true,
        "description": "This called when Drawer should be closed",
        "tags": {}
      },
      {
        "name": "placement",
        "type": {
          "name": "enum",
          "raw": "\"top\" | \"bottom\" | \"left\" | \"right\"",
          "options": [
            "'top'",
            "'bottom'",
            "'left'",
            "'right'"
          ]
        },
        "isRequired": false,
        "description": "The Drawer can appear from any side of the screen. The 'placement'\noption allows to choose where it appears from.",
        "tags": {
          "defaultValue": {
            "name": "defaultValue",
            "value": "`right`"
          }
        },
        "defaultValue": "`right`"
      },
      {
        "name": "size",
        "type": {
          "name": "enum",
          "raw": "\"xs\" | \"sm\" | \"md\" | \"lg\" | \"xl\" | \"full\"",
          "options": [
            "'xs'",
            "'sm'",
            "'md'",
            "'lg'",
            "'xl'",
            "'full'"
          ]
        },
        "isRequired": true,
        "description": "The Drawer size.",
        "tags": {
          "defaultValue": {
            "name": "defaultValue",
            "value": "`md`"
          }
        },
        "defaultValue": "`md`"
      }
    ],
    "description": "The component description here",
    "tags": {
      "since": {
        "name": "since",
        "value": "1.0.0"
      }
    }
  }
]
```

This information can be used to create an interface similar to what you can see below:

![UI Example](https://user-images.githubusercontent.com/230476/103157421-767c6700-4767-11eb-833b-fb77e48bf60d.png)

## Thanks

Inspired by [react-docgen-typescript](https://github.com/styleguidist/react-docgen-typescript).

## License

This project is licensed under the [MIT License](LICENSE.md).

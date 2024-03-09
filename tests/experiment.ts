import docgen from '../src';
import util from 'util';
import path from 'path';
// import fs from 'fs';

function inspect(obj: unknown): void {
  // eslint-disable-next-line
  console.log(util.inspect(obj, false, 15, true));
}

(async function (): Promise<void> {
  const components = docgen.parse([
    // {
    // root: path.resolve(
    // path.join(__dirname, '../../../../../frontile/packages/core/addon')
    // ),
    // pattern: 'components/**/*.ts'
    // }
    {
      options: {
        // tsconfigPath: 'packages/buttons/tsconfig.json',
        compilerOptions: {
          allowJs: true
        }
      },
      // root: path.resolve(path.join(__dirname, '__fixtures__')),
      // pattern: 'test.js'
      root: path.resolve(path.join(__dirname, '../../frontile')),
      // pattern: 'packages/*/declarations/components/*.d.ts'
      pattern: 'packages/overlays/declarations/components/popover.d.ts'
    }
    // {
    //   options: {
    //     // tsconfigPath: 'packages/buttons/tsconfig.json',
    //     compilerOptions: {
    //       allowJs: true
    //     }
    //   },
    //   // root: path.resolve(path.join(__dirname, '__fixtures__')),
    //   // pattern: 'test.js'
    //   root: path.resolve(path.join(__dirname, '__fixtures__')),
    //   pattern: 'drawer.ts'
    // }
  ]);

  // const data = JSON.stringify(components, null, 2);
  // fs.writeFileSync('output.json', data);

  inspect(components);
})();

import docgen from '../src';
import util from 'util';
import path from 'path';
// import fs from 'fs';

function inspect(obj: unknown): void {
  console.log(util.inspect(obj, false, 15, true));
}

(async function (): Promise<void> {
  const components = docgen([
    // {
    // root: path.resolve(
    // path.join(__dirname, '../../../../../frontile/packages/core/addon')
    // ),
    // pattern: 'components/**/*.ts'
    // }
    {
      options: {
        compilerOptions: {
          allowJs: true
        }
      },
      // root: path.resolve(path.join(__dirname, '__fixtures__')),
      // pattern: 'test.js'
      root: path.resolve(path.join(__dirname, '../../frontile')),
      pattern: '**/addon/**/components/**/*.ts'
    }
  ]);

  // const data = JSON.stringify(components, null, 2);
  // fs.writeFileSync('output.json', data);

  inspect(components);
})();

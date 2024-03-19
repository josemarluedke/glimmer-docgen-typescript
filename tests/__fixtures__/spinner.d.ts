/* eslint-disable node/no-missing-import */
import type { TOC } from '@ember/component/template-only';
import { type SpinnerVariants } from '@frontile/theme';

/**
 * My cool component
 * @default cool
 */
declare const Spinner: TOC<{
  Element: SVGElement;
  Args: {
    class?: string;
    size?: SpinnerVariants['size'];
    intent?: SpinnerVariants['intent'];
  };
}>;
export { Spinner };
export default Spinner;

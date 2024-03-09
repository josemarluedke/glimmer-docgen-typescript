import Component from '@glimmer/component';
import { type ButtonSignature } from './button';
// eslint-disable-next-line
import type { WithBoundArgs, ModifierLike } from '@glint/template';
interface DropdownArgs {
  /**
   * Whether the dropdown should close upon selecting an item.
   *
   * @defaultValue true
   */
  closeOnItemSelect?: boolean;

  someRandomElement?: HTMLElement;
}

interface Transition {
  didTransitionIn?: () => void;
  didTransitionOut?: () => void;
  enterClass?: string;
  enterActiveClass?: string;
  enterToClass?: string;
  isEnabled?: boolean;
  leaveClass?: string;
  leaveActiveClass?: string;
  leaveToClass?: string;
  name?: string;
  parentSelector?: string;
}

interface DropdownSignature {
  Args: DropdownArgs;
  Element: HTMLUListElement;
  Blocks: {
    default: [
      {
        /**
         * The trigger component is yielded
         */
        Trigger: WithBoundArgs<typeof Trigger, 'anchor' | 'toggle' | 'trigger'>;
        Menu: WithBoundArgs<
          typeof Menu,
          'toggle' | 'Content' | 'closeOnItemSelect'
        >;
      },
      number,
      item: string
    ];
  };
}

declare class Dropdown extends Component<DropdownSignature> {}
interface TriggerArgs
  extends Pick<
    ButtonSignature['Args'],
    'appearance' | 'intent' | 'size' | 'isInGroup' | 'class'
  > {
  /**
   * @internal
   */
  anchor: ModifierLike<{
    Element: HTMLElement;
  }>;
  trigger: ModifierLike<{
    Element: HTMLElement;
  }>;
  /**
   * @internal
   */
  toggle: () => void;

  transition?: Transition;
}
export interface TriggerSignature {
  Args: TriggerArgs;
  Element: HTMLButtonElement;
  Blocks: {
    default: [];
  };
}
declare class Trigger extends Component<TriggerSignature> {
  get anchor(): ModifierLike<{
    Element: HTMLElement;
  }>;

  get trigger(): ModifierLike<{
    Element: HTMLElement;
  }>;

  handleKeyDown: (event: KeyboardEvent) => void;
  handleKeyUp: (event: KeyboardEvent) => void;
}
interface MenuArgs {
  /**
   * @internal
   */
  closeOnItemSelect?: boolean;

  /**
   * @internal
   */
  toggle: () => void;
  onAction?: (key: string) => void;
  /**
   * @defaultValue true
   */
  blockScroll?: boolean;
  /**
   * @defaultValue false
   */
  disableFocusTrap?: boolean;
}
export interface MenuSignature {
  Args: MenuArgs;
  Element: HTMLUListElement;
  Blocks: {
    default: [];
  };
}
declare class Menu extends Component<MenuSignature> {
  get classNames(): string;
  onAction: (key: string) => void;
  get blockScroll(): boolean;
  get disableFocusTrap(): boolean;
}
export { Dropdown, type DropdownSignature };
export default Dropdown;
//# sourceMappingURL=dropdown.d.ts.map

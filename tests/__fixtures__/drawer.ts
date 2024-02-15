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
    default: [{ header: unknown; body: unknown; footer: unknown }];
  };
  Element: HTMLDivElement;
}

/**
 * The component description here
 *
 * @since 1.0.0
 */
export default class Drawer extends Component<DrawerSignature> {}

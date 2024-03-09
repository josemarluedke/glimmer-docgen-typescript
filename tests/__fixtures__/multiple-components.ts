import Component from '@glimmer/component';

interface ButtonArgs {
  type: string;
  appearance: string;
}

interface Signature {
  Args: ButtonArgs;
  Blocks: {
    default: [{ classNames: string }];
  };
  Element: HTMLButtonElement;
}

// eslint-disable-next-line
class NotExportedButton extends Component<Signature> { }

export class ButtonNotDefault extends Component<Signature> {}
export default class ButtonDefault extends Component<Signature> {}

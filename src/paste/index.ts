import { compact, flow, includes, pullAll, split } from 'lodash/fp';
import { createSingleton } from '../util';

const zx = createSingleton('zx', async () => import('zx'));

export enum Selection {
  Clipboard = 'clipboard',
  Primary = 'primary',
  Secondary = 'secondary',
}

export enum FormatTo {
  Gfm = 'gfm-raw_html',
  Html = 'text/html',
}

const xclipSpecialTargets = ['TIMESTAMP', 'TARGETS', 'MULTIPLE', 'SAVE_TARGETS'];

export const getFormattedClipboard = async (
  selection: Selection = Selection.Clipboard,
  to: FormatTo = FormatTo.Gfm,
): Promise<string> => {
  const { $ } = await zx.get();
  $.verbose = false;

  const targets = flow(
    split('\n'),
    compact,
    pullAll(xclipSpecialTargets),
  )((await $`xclip -o -selection ${selection} -target TARGETS`).stdout);

  if (to === FormatTo.Gfm) {
    if (includes('text/html')(targets)) {
      return $`xclip -o -selection ${selection} -target text/html`
        .pipe($`pandoc --from=html --to=gfm-raw_html --wrap=none`)
        .then((s) => s.stdout);
    } else {
      return $`xclip -o -selection ${selection}`
        .pipe($`pandoc --from=html --to=gfm-raw_html --wrap=none`)
        .then((s) => s.stdout);
    }
  } else if (to === FormatTo.Html) {
    if (includes('text/html')(targets)) {
      return $`xclip -o -selection ${selection} -target text/html`.then((s) => s.stdout);
    } else {
      return $`xclip -o -selection ${selection}`.then((s) => s.stdout);
    }
  } else {
    return $`xclip -o -selection ${selection}`.then((s) => s.stdout);
  }
};

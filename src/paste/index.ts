import os from 'os';
import { compact, flow, includes, pullAll, split } from 'lodash/fp';
import { createSingleton } from '../util';
import { logger } from '../common/logger';

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

  if (os.platform() === 'linux') {
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
  } else if (os.platform() === 'darwin') {
    if (to === FormatTo.Gfm) {
      try {
        return $`osascript -e 'the clipboard as «class HTML»'`
          .pipe($`perl -ne 'print chr foreach unpack("C*",pack("H*",substr($_,11,-3)))'`)
          .pipe($`pandoc --from=html --to=gfm-raw_html --wrap=none`)
          .then((s) => s.stdout);
      } catch (err) {
        logger.error(err);
        return '';
      }
    } else if (to === FormatTo.Html) {
      try {
        return $`osascript -e 'the clipboard as «class HTML»'`
          .pipe($`perl -ne 'print chr foreach unpack("C*",pack("H*",substr($_,11,-3)))'`)
          .then((s) => s.stdout);
      } catch (err) {
        logger.error(err);
        return '';
      }
    } else {
      return $`pbpaste`.then((s) => s.stdout);
    }
  } else {
    logger.error(`${os.platform()} is not supported`);
    return '';
  }
};

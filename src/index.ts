import { activateHelper } from 'coc-helper';
import { ExtensionContext, workspace } from 'coc.nvim';
import { appendTextOnCursor, Config, ConfigManager, EXT_NAME, logger } from './common';
import { getFormattedClipboard, FormatTo } from './paste/index';

export async function activate(context: ExtensionContext): Promise<void> {
  await activateHelper(context);

  let cfg: Config;
  {
    const cm = new ConfigManager();
    context.subscriptions.push(cm);
    cfg = cm.cfg;
    if (!cfg.enable) {
      return;
    }
    logger.info(`${EXT_NAME} activated!`);
    logger.debug(`configurations are applied: ${JSON.stringify(cfg, null, 2)}`);
  }

  context.subscriptions.push(
    workspace.registerKeymap(['n'], 'paste-pandoc-gfm', async () => {
      const str = await getFormattedClipboard(cfg.selection, FormatTo.Gfm);
      return appendTextOnCursor(str);
    }),
    workspace.registerKeymap(['n'], 'paste-pandoc-markdown', async () => {
      const str = await getFormattedClipboard(cfg.selection, FormatTo.Gfm);
      return appendTextOnCursor(str);
    }),
    workspace.registerKeymap(['n'], 'paste-pandoc-html', async () => {
      const str = await getFormattedClipboard(cfg.selection, FormatTo.Html);
      return appendTextOnCursor(str);
    }),
  );
}

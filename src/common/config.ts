import { Disposable, workspace } from 'coc.nvim';
import { Selection } from '../paste';
import { CONFIG_NAME } from './constant';

export enum LogLevel {
  Trace = 'trace',
  Debug = 'debug',
  Info = 'info',
  Warn = 'warn',
  Error = 'error',
  Fatal = 'fatal',
  Off = 'off',
}

export interface Config {
  enable: boolean;
  logLevel: LogLevel;
  selection: Selection;
}

const defaultConfig: Config = {
  enable: true,
  logLevel: LogLevel.Info,
  selection: Selection.Clipboard,
};

export class ConfigManager implements Disposable {
  cfg: Config;
  private disposables: Disposable[];
  constructor() {
    this.cfg = defaultConfig;
    this.disposables = [];

    // does not work properly
    workspace.onDidChangeConfiguration(
      (ev) => {
        if (ev.affectsConfiguration(CONFIG_NAME)) {
          this.update();
        }
      },
      null,
      this.disposables,
    );

    this.update();
  }

  public dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
  }

  private update(): void {
    const configuration = workspace.getConfiguration(CONFIG_NAME);
    this.cfg.enable = configuration.get<boolean>('enable', defaultConfig.enable);
    this.cfg.logLevel = configuration.get<LogLevel>('logLevel', defaultConfig.logLevel);
    this.cfg.selection = configuration.get<Selection>('selection', defaultConfig.selection);
  }
}

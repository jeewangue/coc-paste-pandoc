import _ from 'lodash';
import { Mutex } from 'async-mutex';

export class Once<T> {
  private done = false;
  private promise: Promise<void>;
  private resolver: () => void = _.noop;
  private value?: T;
  private mutex: Mutex = new Mutex();

  constructor() {
    this.promise = new Promise((resolve) => {
      this.resolver = resolve;
    });
  }

  public async do(f: () => Promise<T>): Promise<T> {
    if (!this.done) {
      const release = await this.mutex.acquire();
      try {
        if (!this.done) {
          this.value = await f();
          this.done = true;
          this.resolver();
        }
      } catch (error) {
        this.done = false;
        throw error;
      } finally {
        release();
      }
    }
    return this.value as T;
  }

  public async wait(): Promise<void> {
    await this.promise;
  }
}

export interface Singleton<T> {
  get: () => Promise<T>;
}

export interface SingletonMap {
  [name: string]: Singleton<any>;
}

export const singletonMap: SingletonMap = {};

export function createSingleton<T>(name: string, initializer: () => Promise<T>): Singleton<T> {
  if (singletonMap[name]) {
    return singletonMap[name] as Singleton<T>;
  }

  const once = new Once<T>();
  let instance: T | undefined;

  const get = async (): Promise<T> => {
    if (!instance) {
      instance = await once.do(initializer);
    }
    return instance;
  };

  const singleton: Singleton<T> = { get };
  singletonMap[name] = singleton;

  return singleton;
}

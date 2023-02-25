import { Once, createSingleton } from './Once';

describe('Once', () => {
  let once: Once<number>;

  beforeEach(() => {
    once = new Once<number>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute the function only once', async () => {
    const f = jest.fn(() => Promise.resolve(42));
    const result1 = await once.do(f);
    const result2 = await once.do(f);

    expect(result1).toBe(42);
    expect(result2).toBe(42);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('should not execute the function if the value is already set', async () => {
    const f = jest.fn(() => Promise.resolve(42));
    once['done'] = true;
    once['value'] = 42;

    const result = await once.do(f);

    expect(result).toBe(42);
    expect(f).toHaveBeenCalledTimes(0);
  });

  it('should re-throw the error if the function throws an error', async () => {
    const f = jest.fn(() => Promise.reject(new Error('Something went wrong!')));

    await expect(once.do(f)).rejects.toThrowError('Something went wrong!');
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('should wait for the function to complete', async () => {
    const f = jest.fn<Promise<number>, []>(() => new Promise((resolve) => setTimeout(() => resolve(42), 100)));
    const result1 = once.do(f);
    const result2 = once.do(f);
    const promise = once.wait();

    expect(await result1).toBe(42);
    expect(await result2).toBe(42);
    await promise;
  });
});

describe('createSingleton', () => {
  class MySingleton {
    public name: string;

    constructor(name: string) {
      this.name = name;
    }

    public async doSomething() {
      return Promise.resolve(`Hello, I'm ${this.name}`);
    }
  }

  const singleton1 = createSingleton('MySingleton', async () => new MySingleton('Singleton 1'));
  const singleton2 = createSingleton('MySingleton', async () => new MySingleton('Singleton 2'));
  const singleton3 = createSingleton('AnotherSingleton', async () => new MySingleton('Another Singleton'));

  it('should create singleton instances', async () => {
    const instance1 = await singleton1.get();
    const instance2 = await singleton1.get();

    expect(instance1).toBe(instance2);
    expect(instance1.name).toBe('Singleton 1');
  });

  it('should reuse existing singleton instances', async () => {
    const instance1 = await singleton1.get();
    const instance2 = await singleton2.get();

    expect(instance1).toBe(instance2);
    expect(instance1.name).toBe('Singleton 1');
    expect(instance2.name).toBe('Singleton 1');
  });

  it('should create multiple singleton instances', async () => {
    const instance1 = await singleton1.get();
    const instance2 = await singleton3.get();

    expect(instance1.name).toBe('Singleton 1');
    expect(instance2.name).toBe('Another Singleton');
  });
});

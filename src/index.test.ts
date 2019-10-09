import memoize, { memStore } from '.';

describe("Memoize", () => {

    test('Should memoize an immediate value', async () => {
        let i = 1;
        async function fn(n: number) {
            return (i++) + n;
        }
        const mem = memoize(fn);
        expect(await mem(1)).toEqual(await mem(1));
    });

    test('Should memoize a deferred value', async () => {
        async function fn(): Promise<number> {
            return new Promise((resolve) => {
                setTimeout(() => resolve(1), 250);
            });
        }
        const mem = memoize(fn);
        await expect(mem()).resolves.toBe(1);
    });

    test('Should rethrow an immediate error', async () => {
        expect.assertions(1);
        async function fn() {
            throw Error('💩');
        }
        const mem = memoize(fn);
        await expect(mem()).rejects.toThrowError(Error('💩'));
    });

    test('Should reject memoized if async function rejects', async () => {
        async function fn(): Promise<number> {
            return new Promise((_, reject) => {
                setTimeout(() => reject(Error('💩')), 250);
            });
        }
        const mem = memoize(fn);
        await expect(mem()).rejects.toThrowError(Error('💩'));
    });

    test("Should renew on undefined value", async () => {
        let i = 1;
        async function fn() {
            return i++;
        }
        const mem = memoize(fn, {
            get: () => (i === 1) ? Promise.reject() : Promise.resolve(i),
            set: () => Promise.resolve(),
            toKey: (...args) => Promise.resolve(JSON.stringify(args)),
        });
        await expect(mem()).resolves.toBe(1);
        await expect(mem()).resolves.toBe(2);
        await expect(mem()).resolves.toBe(2);
    });

    test("Should call fn if toKey fails", async () => {
        async function fn() {
            return 1;
        }
        const mem = memoize(fn, {
            get: () => Promise.resolve(0),
            set: () => Promise.resolve(),
            toKey: () => Promise.reject(),
        });
        await expect(mem()).resolves.toBe(1);
    });

    test("Should return function value if set fails", async () => {
        async function fn() {
            return 1;
        }
        const mem = memoize(fn, {
            get: () => Promise.reject(),
            set: () => Promise.reject(),
            toKey: () => Promise.resolve(''),
        });
        await expect(mem()).resolves.toBe(1);
    });

    test('Should memoize Date.prototype.now', async () => {
        const mem = memoize(async () => Date.now());
        expect(await mem()).toEqual(await new Promise((resolve) => {
            setTimeout(() => resolve(mem()), 100);
        }));
    });
});

describe('memStore', () => {

    test('Should invalidate cache', async () => {
        const cache = new Map();
        const mem = memoize(async () => Date.now(), memStore(cache));
        expect(await mem()).not.toEqual(await new Promise((resolve) => {
            cache.clear();
            setTimeout(() => resolve(mem()), 100);
        }));
    });

    test('Should serialize empty argument list', async () => {
        const store = memStore();
        const args: [] = [];
        expect(await store.toKey(args)).toBe(JSON.stringify(args));
    });

    test('Should serialize non-empty argument list', async () => {
        const store = memStore();
        const args = ['Hi', true];
        expect(await store.toKey(args)).toBe(JSON.stringify(args));
    });
});

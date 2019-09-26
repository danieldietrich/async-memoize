/**
 * Memoizes an asynchronous function `fn` by returning a new function with the same signature that caches function calls.
 *
 * A memoized function behaves like the original function in the way that:
 * - if a cached value of a previous function call exists, it is returned
 * - the original function is called at most once per memoize() call
 * - if a memoization store (read: cache) operation produces an exception, it is not exposed to the outside
 * - only results of an original function call are exposed to the outside
 *
 * That way memoize() keeps the semantics of the original function (modulo caching).
 *
 * The memoize() function takes a second, optional parameter `store`.
 * A store tells memoize how to produce cache keys from an argument list,
 * how to set values and how to get them.
 *
 * A default store can be creating by calling memoize.memStore() with an optional cache parameter.
 * The injection of a cache allows it to inverse the control of cache invalidation.
 * Namely, a cache is cleared outside of the memoize() function.
 *
 * @param fn an arbitrary function or lambda expression
 * @param store an option key-value store, default: memoize.memStore
 * @returns a new function that has the same signature like fn
 */
// DEV-NOTE: we cannot use async/await because of the ES6 target
function memoize<A extends unknown[], K, V>(fn: (...args: A) => Promise<V>, store?: memoize.Store<K, V>): typeof fn {
    const { get, set, toKey } = store || memoize.memStore<V>() as memoize.Store<unknown, V>;
    return (...args: A) => toKey(args)
        .catch(() => undefined)
        .then(key => (key === undefined)
            ? fn(...args)
            : get(key).catch(() =>
                fn(...args).then(value =>
                    set(key, value).then(() => value).catch(() => value),
                ),
            ),
        );
}

namespace memoize {

    // Just reject() without args, errors are not needed.
    export type Store<K, V> = {
        get(key: K): Promise<V>; // rejected if not found
        set(key: K, value: V): Promise<void>; // resolved on success, rejected on failure
        toKey(args: unknown[]): Promise<K>;
    };

    // an ever growing in-memory store (be aware of memory leaks!)
    export function memStore<V>(cache: Map<string, V> = new Map()): memoize.Store<string, V> {
        return {
            get: (key: string) => new Promise((resolve, reject) => {
                const value = cache.get(key);
                (value === undefined) ? reject() : resolve(value);
            }),
            set: (key, value) => new Promise((resolve) => {
                cache.set(key, value);
                resolve();
            }),
            toKey: (args) => new Promise((resolve) => {
                return resolve(JSON.stringify(args));
            }),
        };
    }
}

export = memoize;

[![npm version](https://img.shields.io/npm/v/@danieldietrich/async-memoize?logo=npm&style=flat-square)](https://www.npmjs.com/package/@danieldietrich/async-memoize/)[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@danieldietrich/async-memoize?style=flat-square)](https://snyk.io/test/npm/@danieldietrich/async-memoize)[![minzipped size](https://img.shields.io/bundlephobia/minzip/@danieldietrich/async-memoize?style=flat-square)](https://bundlephobia.com/result?p=@danieldietrich/async-memoize@latest)
&nbsp;
[![build](https://img.shields.io/travis/danieldietrich/async-memoize?logo=github&style=flat-square)](https://travis-ci.org/danieldietrich/async-memoize/)[![coverage](https://img.shields.io/codecov/c/github/danieldietrich/async-memoize?style=flat-square)](https://codecov.io/gh/danieldietrich/async-memoize/)
&nbsp;
![Platform](https://img.shields.io/badge/platform-Node%20v10%20+%20Browser%20%28ES6%2fES2015%29-decc47?logo=TypeScript&style=flat-square)
&nbsp;
[![donate](https://img.shields.io/badge/Donate-PayPal-blue.svg?logo=paypal&style=flat-square)](https://paypal.me/danieldietrich13)[![patrons](https://img.shields.io/liberapay/patrons/danieldietrich?style=flat-square)](https://liberapay.com/danieldietrich/)[![license](https://img.shields.io/github/license/danieldietrich/async-memoize?style=flat-square)](https://opensource.org/licenses/MIT/)
&nbsp;
[![Follow](https://img.shields.io/twitter/follow/danieldietrich?label=Follow&style=social)](https://twitter.com/danieldietrich/)

# async-memoize

Nifty async function memoization.

Features:

* Featherweight implementation
* Async store (= cache) is configurable, in-memory by default
* Inversion of control: store is injected
* No active cache invalidation, resources are handled by the caller
* Composable: a memoized function can be memoized using a different store
* Usr-defined cache-key creation

Caution:

The default in-memory store is meant to be used in a local context. It grows indefinitely.
Implement your own Store or use an existing one in order to get more control over the lifecycle of cached elements.

## Installation

```bash
npm i @danieldietrich/async-memoize
```

## Usage

The module supports ES6 _import_ and CommonJS _require_ style.

<tt>memoize(fn)</tt> creates a memoized version of the given function <tt>fn</tt> with the default in-memory store. It caches function calls. The function arguments are used as key.

```ts
import memoize from '@danieldietrich/async-memoize';

// A memoized version of the getLicense function (see below).
// By default, an in-memory cache is utilized.
// The memoized varion has the 
// Inferred type: (string) => Promise<License>
const getLicenseMemoized = memoize(getLicense);

// Calls the GitHub API because there is no cache hit for 'MIT'
getLicenseMemoized('MIT').then(console.log);

// Gets the result from in-memory cache for key 'MIT'
getLicenseMemoized('MIT').then(console.log);

// Example function, type declarations and helper functions omitted.
async function getLicense(spdxId: string): Promise<License> {
    return http_get(`https://api.github.com/licenses/${spdxId}`);
}
```

The memoization function is highly composable.

```ts
import memoize, { Store } from 'memoize';

const es6Store: Store<string, ReturnType<getLicense>> = {
    get: (key) => new Promise((resolve, reject) => {
        const value = /* TODO: retrieve value */
        (value === undefined) ? reject() : resolve(value);
    }),
    set: (key, value) => new Promise((resolve) => {
        /* TODO: store value */;
        resolve(value);
    }),
    toKey: (args) => Promise.resolve(JSON.stringify(args))
};

const es8Store: Store<string, ReturnType<getLicense>> = {
    get: async (key) => /* TODO: retrieve value */,
    set: async (key, value) => { /* TODO: store value */; return value; }
    toKey: async (args) => JSON.stringify(args);
};

const getLicenseMemoized = memoize(memoize(getLicense, es8Store));
```

---

Copyright &copy; 2019 by [Daniel Dietrich](cafebab3@gmail.com). Released under the [MIT](https://opensource.org/licenses/MIT/) license.

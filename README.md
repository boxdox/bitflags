# @boxdox/bitflags

> type-safe, dependency, bit-mask flags with named keys for TypeScript and JavaScript

[![npm](https://img.shields.io/npm/v/@boxdox/bitflags.svg)](https://www.npmjs.com/package/@boxdox/bitflags)
[![License](https://img.shields.io/github/license/boxdox/bitflags)](LICENSE)

**BitFlags** gives you a zero-dependency way to manage sets of boolean flags using bit-masks, but with ergonomic _named string keys_ instead of magic numbers.

- :100: **Type-safe** flag keys (TypeScript generics)
- :rocket: **Fast** bitwise manipulation
- :wrench: **Small** (single file, tree-shakable)
- :book: **Easy** `toNumber`, `toBinaryString`, `fromBinaryString`, `set/clear/toggle/isSet`, and more

## Installation

```sh
npm install @boxdox/bitflags
# or
yarn add @boxdox/bitflags
```

## Usage

```ts
import { BitFlags } from '@boxdox/bitflags'

// Define your flags as string keys mapped to unique bit positions (0-based)
const MyFlags = {
  READ: 0,
  WRITE: 1,
  EXECUTE: 2,
}

const flags = new BitFlags(MyFlags)

// Set flags by name (type checked!)
flags.set('READ').set('EXECUTE')

// Check flags
console.log(flags.isSet('WRITE')) // false
console.log(flags.isSet('EXECUTE')) // true

// Convert to number
const mask = flags.toNumber() // e.g. 0b101 === 5

// Binary string representation
console.log(flags.toBinaryString()) // "101" (padded as needed)

// Get all set flag names
console.log(flags.getCurrentFlags()) // ['READ', 'EXECUTE']

// Count enabled flags
console.log(flags.countOnes()) // 2

// Clear and set all
flags.clearAll()
flags.setAll()
```

## API

| Method                                   | Description                                       |
| ---------------------------------------- | ------------------------------------------------- |
| `constructor(flags, initialValue?)`      | create a BitFlags instance                        |
| `static fromBinaryString(string, flags)` | parse from a binary string                        |
| `toNumber()`                             | get the current value as a number                 |
| `capacity()`                             | get the minimum bit capacity needed for all flags |
| `toBinaryString(capacity?)`              | get a padded binary string                        |
| `set(flag)`                              | set a flag (by name or bit), chainable            |
| `clear(flag)`                            | clear a flag (by name or bit), chainable          |
| `toggle(flag)`                           | flip a flag (by name or bit), chainable           |
| `isSet(flag)`                            | checks if given flag is currently set             |
| `clearAll()`                             | clear all flags                                   |
| `setAll()`                               | set all flags defined                             |
| `getCurrentFlags()`                      | array of flag names currently set                 |
| `countOnes()`                            | count of flags that are currently enabled         |

## Contributing

PR's welcomed for suggesting ideas, fixing bugs, writing tests, improving docs, or submitting code for new features

> this is 100% type-safe, with 100% test coverage. please take care of this while raising PR's

1. **fork this repository**
2. **install dependencies using Bun:**

   ```sh
   bun install
   ```

3. **check that everything builds and tests pass, along with coverage:**
   ```sh
   bun run build
   bun test
   ```

## License

MIT

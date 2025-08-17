/**
 * object mapping string keys to unique bit positions (as numbers).
 * @example { FOO: 0, BAR: 1 }
 */
type Flags<FlagKeys extends string> = Record<FlagKeys, number>

/**
 * BitFlags is a type-safe utility class for handling named bitmask flags.
 * Supports set/clear/toggle/testing of flags via string keys, and conversion
 * to/from numbers and binary strings.
 *
 * @example
 * const flags = { Read: 0, Write: 1, Execute: 2 }
 * const bf = new BitFlags(flags)
 * bf.set("Read")
 * bf.set("Write")
 * console.log(bf.toBinaryString())
 */
export class BitFlags<FlagKeys extends string> {
  #bits: number
  #flags: Flags<FlagKeys>
  #flagsSet: Set<number>
  #capacity: number

  /**
   * create a new BitFlags instance.
   *
   * @param flags - object mapping flag names to unique bit positions (0-based)
   * @param initialValue - optional initial value (number, defaults to 0)
   * @throws if flags is empty or flag numbers are not unique
   */
  constructor(flags: Flags<FlagKeys>, initialValue: number = 0) {
    if (!Object.values(flags).length) {
      throw new Error('passed flags cannot be empty')
    }
    this.#flags = flags
    this.#bits = initialValue
    this.#flagsSet = this.#generateFlagSet(flags)
    this.#capacity = this.#calculateCeiling(Math.max(...Object.values<number>(flags)))
  }

  #generateFlagSet(flags: Flags<FlagKeys>): Set<number> {
    const set = new Set<number>()
    Object.entries<number>(flags).forEach(([key, bitPosition]) => {
      if (set.has(bitPosition)) {
        throw new Error(`${key}: ${bitPosition} already exists`)
      }
      set.add(bitPosition)
    })
    return set
  }

  #getBitPositionFromFlag(value: FlagKeys | number): number {
    if (typeof value === 'number') {
      if (this.#flagsSet.has(value)) {
        return value
      } else {
        throw new Error(
          `invalid number: ${value}, possible values are = ${Array.from(this.#flagsSet).join(', ')}`
        )
      }
    }
    if (!Object.prototype.hasOwnProperty.call(this.#flags, value)) {
      throw new Error(
        `invalid key: ${value}, possible values ${Array.from(Object.keys(this.#flags)).join(', ')}`
      )
    }
    return this.#flags[value]
  }

  #calculateCeiling(count: number): number {
    return Math.pow(2, Math.ceil(Math.log2(count + 1)))
  }

  /**
   * construct a BitFlags instance from a binary string (e.g. "101").
   * @param inputString - string of only 0 and 1 characters.
   * @param flags - flag definition, same as constructor.
   * @throws if inputString or flags are invalid or bits exceed capacity.
   */
  static fromBinaryString<FlagKeys extends string>(
    inputString: string,
    flags: Flags<FlagKeys>
  ): BitFlags<FlagKeys> {
    if (!/^[01]+$/.test(inputString)) {
      throw new Error(`input string should only contain 0 or 1 as characters`)
    }

    const value = Number.parseInt(inputString, 2)

    if (!Number.isInteger(value) || Number.isNaN(value)) {
      throw new Error(`couldn't parse input string as flag, parsed value: ${value}`)
    }

    if (!Object.values(flags).length) {
      throw new Error('passed flags cannot be empty')
    }
    const maxAllowedBit = Math.max(...Object.values<number>(flags))
    const maxMask = (1 << (maxAllowedBit + 1)) - 1
    if ((value & ~maxMask) !== 0) {
      throw new Error(
        `input value contains bit outside of defined flags. offending bits: ${(value & ~maxMask).toString(2)}`
      )
    }

    return new BitFlags(flags, value)
  }

  /**
   * returns the internal value as a number combining all set flags
   */
  toNumber(): number {
    return this.#bits
  }

  /**
   * returns the minimum number of bits needed to represent all possible flags (as a power of 2).
   */
  capacity(): number {
    return this.#capacity
  }

  /**
   * returns the current value as a (zero-padded) binary string.
   * @param capacity - minimum bit width; actual string may be longer to fit all flags.
   * @returns string of 0 and 1, left-padded as needed.
   */
  toBinaryString(capacity: number = this.#capacity): string {
    const padding = Math.max(capacity, this.#capacity)
    return this.#bits.toString(2).padStart(padding, '0')
  }

  /**
   * sets a flag by key or bit position.
   * @param flag - string flag name or (valid) bit position
   * @returns itself (chainable)
   */
  set(flag: FlagKeys | number): this {
    const bitPosition = this.#getBitPositionFromFlag(flag)
    this.#bits |= 1 << bitPosition
    return this
  }

  /**
   * un-sets (clears) a flag by key or bit position.
   * @param flag - string flag name or (valid) bit position
   * @returns itself (chainable)
   */
  clear(flag: FlagKeys | number): this {
    const bitPosition = this.#getBitPositionFromFlag(flag)
    this.#bits &= ~(1 << bitPosition)
    return this
  }

  /**
   * toggles a flag (on/off).
   * @param flag - string flag name or (valid) bit position
   * @returns itself (chainable)
   */
  toggle(flag: FlagKeys | number): this {
    const bitPosition = this.#getBitPositionFromFlag(flag)
    this.#bits ^= 1 << bitPosition
    return this
  }

  /**
   * checks if a flag is set.
   * @param flag - string flag name or (valid) bit position
   * @returns true if set, false otherwise.
   */
  isSet(flag: FlagKeys | number): boolean {
    const bitPosition = this.#getBitPositionFromFlag(flag)
    return (this.#bits & (1 << bitPosition)) !== 0
  }

  /**
   * clears (un-sets) all flags.
   */
  clearAll(): void {
    this.#bits = 0
  }

  /**
   * sets all defined flags.
   */
  setAll(): void {
    this.#flagsSet.forEach(bitPosition => {
      this.#bits |= 1 << bitPosition
    })
  }

  /**
   * returns an array of flag names (strings) which are currently set.
   * the order is the same as the keys of the original 'flags' definition.
   */
  getCurrentFlags(): Array<FlagKeys> {
    return Object.entries<number>(this.#flags)
      .map(([flag, bitPosition]) => (this.isSet(bitPosition) ? flag : undefined))
      .filter((item): item is FlagKeys => !!item)
  }

  /**
   * counts the number of bits set to 1 (i.e., enabled flags).
   */
  countOnes(): number {
    let count = 0
    let n = this.#bits

    while (n > 0) {
      n &= n - 1
      count += 1
    }

    return count
  }
}

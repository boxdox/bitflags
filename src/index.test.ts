import { describe, expect, it } from 'bun:test'
import { BitFlags } from './index.js'

const PermissionFlags = {
  READ: 0,
  WRITE: 1,
  EXECUTE: 2,
}

describe('initialization', () => {
  it('should have initial value 0', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(bf.toNumber()).toBe(0)
  })

  it('should accept an initialValue and reflect it in value()', () => {
    const bf = new BitFlags(PermissionFlags, 3)
    expect(bf.toNumber()).toBe(3)
    expect(bf.isSet('READ')).toBeTrue()
    expect(bf.isSet('WRITE')).toBeTrue()
    expect(bf.isSet('EXECUTE')).toBeFalse()
  })

  it('should throw in case of empty flags', () => {
    expect(() => new BitFlags({})).toThrow()
  })

  it('should throw if initialValue has bits set outside defined flags', () => {
    const bf = new BitFlags(PermissionFlags, 16)
    expect(bf.toNumber()).toBe(16)
  })

  it('should throw in case of duplicated bit position in flags input', () => {
    expect(() => new BitFlags({ A: 0, B: 0 })).toThrow()
  })
})

describe('initialization from binary string', () => {
  it('creates BitFlags from valid binary string (simple)', () => {
    const bf = BitFlags.fromBinaryString('101', PermissionFlags)
    expect(bf.toNumber()).toBe(5)
    expect(bf.isSet('READ')).toBeTrue()
    expect(bf.isSet('WRITE')).toBeFalse()
    expect(bf.isSet('EXECUTE')).toBeTrue()
  })

  it('throws on non-binary string input', () => {
    expect(() => BitFlags.fromBinaryString('12F0', PermissionFlags)).toThrow()
    expect(() => BitFlags.fromBinaryString('hello', PermissionFlags)).toThrow()
    expect(() => BitFlags.fromBinaryString('10102', PermissionFlags)).toThrow()
    expect(() => BitFlags.fromBinaryString('', PermissionFlags)).toThrow()
  })

  it('parses binary string to value 0 correctly', () => {
    const bf = BitFlags.fromBinaryString('0', PermissionFlags)
    expect(bf.toNumber()).toBe(0)
    expect(bf.isSet('READ')).toBeFalse()
    expect(bf.isSet('WRITE')).toBeFalse()
    expect(bf.isSet('EXECUTE')).toBeFalse()
  })

  it('throws if non flag bits are set', () => {
    // flags highest bit is 2, so legal mask is 0b111 = 7
    // 0b1000 => 8 sets bit 3 which is not in flags
    expect(() => BitFlags.fromBinaryString('1000', PermissionFlags)).toThrow()

    // 0b10101 => 21 sets bits 2, 0, 4; bit 4 is not in flags
    expect(() => BitFlags.fromBinaryString('10101', PermissionFlags)).toThrow()
  })

  it('accepts max legal length in strict mode', () => {
    // 111 is okay (bits 0, 1, 2)
    const bf = BitFlags.fromBinaryString('111', PermissionFlags)
    expect(bf.toNumber()).toBe(7)
    expect(bf.isSet('READ')).toBeTrue()
    expect(bf.isSet('WRITE')).toBeTrue()
    expect(bf.isSet('EXECUTE')).toBeTrue()
  })

  it('throws if flags set is empty and strict is used', () => {
    expect(() => BitFlags.fromBinaryString('101', {})).toThrow()
  })
})

describe('set flags', () => {
  it('should be able to set value from flag', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.set('READ')
    expect(bf.toNumber()).toBe(1)
    bf.set('EXECUTE')
    expect(bf.toNumber()).toBe(5)
  })

  it('should be idempotent when setting already-set bits', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.set('READ')
    expect(bf.toNumber()).toBe(1)
    bf.set('READ')
    expect(bf.toNumber()).toBe(1)
  })

  it('should be able to set value from number', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.set(1)
    expect(bf.toNumber()).toBe(2)
  })

  it('should throw when setting an invalid flag key', () => {
    const bf = new BitFlags(PermissionFlags)
    // @ts-expect-error
    expect(() => bf.set('INVALID')).toThrow()
  })

  it('should throw when setting an invalid number', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(() => bf.set(99)).toThrow()
  })
})

describe('clearing flags', () => {
  it('should be able to clear value from flag', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.set('READ')
    bf.set('WRITE')
    expect(bf.toNumber()).toBe(3)
    bf.clear('READ')
    expect(bf.toNumber()).toBe(2)
  })

  it('should be able to clear value from number', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.set(2)
    expect(bf.toNumber()).toBe(4)
    bf.clear(2)
    expect(bf.toNumber()).toBe(0)
  })

  it('should be idempotent when clearing unset bits', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(bf.toNumber()).toBe(0)
    bf.clear('READ')
    expect(bf.toNumber()).toBe(0)
  })

  it('should throw when clearing an invalid flag key', () => {
    const bf = new BitFlags(PermissionFlags)
    // @ts-expect-error
    expect(() => bf.clear('INVALID')).toThrow()
  })

  it('should throw when clearing an invalid number', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(() => bf.clear(42)).toThrow()
  })
})

describe('toggling flags', () => {
  it('should be able to toggle a bit flag', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.toggle('READ')
    expect(bf.isSet('READ')).toBeTrue()
    bf.toggle('READ')
    expect(bf.isSet('READ')).toBeFalse()
  })

  it('should throw when toggling an invalid key', () => {
    const bf = new BitFlags(PermissionFlags)
    // @ts-expect-error
    expect(() => bf.toggle('INVALID')).toThrow()
  })

  it('should throw when toggling an invalid number', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(() => bf.toggle(123)).toThrow()
  })
})

describe('querying status', () => {
  it('should return correct status using isSet', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(bf.isSet('EXECUTE')).toBeFalse()
    bf.set('EXECUTE')
    expect(bf.isSet('EXECUTE')).toBeTrue()
    expect(bf.toNumber()).toBe(4)
  })

  it('should throw when querying an invalid key', () => {
    const bf = new BitFlags(PermissionFlags)
    // @ts-expect-error
    expect(() => bf.isSet('INVALID')).toThrow()
  })

  it('should throw when querying an invalid number', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(() => bf.isSet(7)).toThrow()
  })
})

describe('binary string output', () => {
  it('should return binary string notation', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(bf.toBinaryString(8)).toBe('00000000')
    bf.set('READ')
    expect(bf.toBinaryString(8)).toBe('00000001')
    bf.set('EXECUTE')
    expect(bf.toBinaryString(8)).toBe('00000101')
  })

  it('should not truncate bits if passed capacity is too small', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.set('EXECUTE')
    expect(bf.toBinaryString(2)).toBe('0100')
  })
})

describe('capacity calculation', () => {
  it('should return capacity based on passed flag values', () => {
    const bf1 = new BitFlags({ A: 0, B: 2, C: 8 })
    expect(bf1.capacity()).toBe(16)
    const bf2 = new BitFlags({ A: 14 })
    expect(bf2.capacity()).toBe(16)
    const bf3 = new BitFlags({ A: 24, B: 4 })
    expect(bf3.capacity()).toBe(32)
  })

  it('should output correct binary string for various capacities', () => {
    const bf = new BitFlags({ A: 24, B: 4 })
    expect(bf.toBinaryString().length).toBe(32)
    expect(bf.toBinaryString(8).length).toBe(32) // should not truncate
  })
})

describe('set/clear all operations', () => {
  it('should set all flags with setAll()', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.setAll()
    expect(bf.toNumber()).toBe(7)
    Object.keys(PermissionFlags).forEach(k => {
      expect(bf.isSet(k as keyof typeof PermissionFlags)).toBeTrue()
    })
  })

  it('should clear all flags with clearAll()', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.setAll()
    bf.clearAll()
    expect(bf.toNumber()).toBe(0)
    Object.keys(PermissionFlags).forEach(k =>
      expect(bf.isSet(k as keyof typeof PermissionFlags)).toBeFalse()
    )
  })
})

describe('get currently set flags', () => {
  it('returns an empty array if no flags are set', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(bf.getCurrentFlags()).toEqual([])
  })

  it('returns single flag when only one is set', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.set('READ')
    expect(bf.getCurrentFlags()).toEqual(['READ'])
  })

  it('returns multiple flags when several are set', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.set('WRITE')
    bf.set('EXECUTE')
    expect(bf.getCurrentFlags()).toEqual(['WRITE', 'EXECUTE'])
  })

  it('returns all flags when all are set', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.setAll()
    expect(bf.getCurrentFlags()).toEqual(['READ', 'WRITE', 'EXECUTE'])
  })

  it('returns correct flags after toggling', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.toggle('READ') // now set
    bf.toggle('WRITE') // now set
    bf.toggle('READ') // unset again
    expect(bf.getCurrentFlags()).toEqual(['WRITE'])
  })

  it('returns correct flags after clearAll()', () => {
    const bf = new BitFlags(PermissionFlags)
    bf.setAll()
    bf.clearAll()
    expect(bf.getCurrentFlags()).toEqual([])
  })

  it('works with non-sequential bit positions', () => {
    const CustomFlags = { FOO: 0, BAR: 3, BAZ: 5 }
    const bf = new BitFlags(CustomFlags)
    bf.set('BAR')
    bf.set('BAZ')
    expect(bf.getCurrentFlags()).toEqual(['BAR', 'BAZ'])
  })

  it('works for initial value', () => {
    const bf = new BitFlags(PermissionFlags, 3) // binary 011, so READ and WRITE
    expect(bf.getCurrentFlags()).toEqual(['READ', 'WRITE'])
  })
})

describe('count ones', () => {
  it('should count ones in given bit flag', () => {
    const bf = new BitFlags(PermissionFlags)
    expect(bf.countOnes()).toBe(0)

    bf.set('READ').set('WRITE')
    expect(bf.countOnes()).toBe(2)

    bf.setAll()
    expect(bf.countOnes()).toBe(3)
  })
})

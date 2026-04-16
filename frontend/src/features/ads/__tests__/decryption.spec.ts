import { describe, it, expect } from 'vitest'
import { decodeAdId, rot13 } from '@/features/ads/utils/decryption'

describe('decodeAdId', () => {
  it('returns raw adId when encrypted is null', () => {
    expect(decodeAdId('hello123', null)).toBe('hello123')
  })

  it('returns raw adId when encrypted is undefined', () => {
    expect(decodeAdId('hello123', undefined)).toBe('hello123')
  })

  it('returns raw adId when encrypted is 0', () => {
    expect(decodeAdId('hello123', 0)).toBe('hello123')
  })

  it('Base64 decodes when encrypted is 1', () => {
    expect(decodeAdId('aGVsbG8=', 1)).toBe('hello')
  })

  it('ROT13 decodes when encrypted is 2', () => {
    expect(decodeAdId('uryyb', 2)).toBe('hello')
  })

  it('handles complex Base64 strings', () => {
    const original = 'some-ad-id-123'
    const encoded = btoa(original)
    expect(decodeAdId(encoded, 1)).toBe(original)
  })

  it('handles complex ROT13 strings', () => {
    const original = 'AbCdEf123'
    const rotated = rot13(original)
    expect(decodeAdId(rotated, 2)).toBe(original)
  })
})

describe('rot13', () => {
  it('shifts letters by 13', () => {
    expect(rot13('hello')).toBe('uryyb')
    expect(rot13('HELLO')).toBe('URYYB')
  })

  it('preserves non-alphabetic characters', () => {
    expect(rot13('hello, world! 123')).toBe('uryyb, jbeyq! 123')
  })

  it('is its own inverse (applying twice returns original)', () => {
    const str = 'Dragons of Mugloar'
    expect(rot13(rot13(str))).toBe(str)
  })

  it('handles empty string', () => {
    expect(rot13('')).toBe('')
  })
})

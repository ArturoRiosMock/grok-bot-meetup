import { describe, expect, it } from 'vitest'

type Candidate = { name: string }

function secureRandom(max: number): number {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return array[0]! % max
}

function pickWinners(pool: Candidate[], count: number): Candidate[] {
  const available = pool.slice()
  const picked: Candidate[] = []
  const n = Math.min(count, available.length)
  for (let i = 0; i < n; i++) {
    const idx = secureRandom(available.length)
    picked.push(available[idx]!)
    available.splice(idx, 1)
  }
  return picked
}

describe('raffle winner selection', () => {
  const candidates = [
    { name: 'Ana' },
    { name: 'Bob' },
    { name: 'Carlos' },
    { name: 'Diana' },
    { name: 'Elena' },
    { name: 'Felipe' }
  ]

  it('picks the requested number of winners', () => {
    const winners = pickWinners(candidates, 4)
    expect(winners).toHaveLength(4)
  })

  it('picks all unique winners', () => {
    const winners = pickWinners(candidates, 4)
    const names = winners.map((w) => w.name)
    expect(new Set(names).size).toBe(4)
  })

  it('handles fewer candidates than requested winners', () => {
    const small = [{ name: 'Ana' }, { name: 'Bob' }]
    const winners = pickWinners(small, 5)
    expect(winners).toHaveLength(2)
    expect(winners.map((w) => w.name).sort()).toEqual(['Ana', 'Bob'])
  })

  it('handles empty pool', () => {
    const winners = pickWinners([], 4)
    expect(winners).toHaveLength(0)
  })

  it('handles single candidate', () => {
    const winners = pickWinners([{ name: 'Solo' }], 1)
    expect(winners).toHaveLength(1)
    expect(winners[0]!.name).toBe('Solo')
  })

  it('picks from full pool when count equals pool size', () => {
    const winners = pickWinners(candidates, candidates.length)
    expect(winners).toHaveLength(candidates.length)
    const names = winners.map((w) => w.name).sort()
    const expected = candidates.map((c) => c.name).sort()
    expect(names).toEqual(expected)
  })

  it('uses crypto randomness (different results on multiple runs)', () => {
    const results = new Set<string>()
    for (let i = 0; i < 20; i++) {
      const winners = pickWinners(candidates, 3)
      results.add(winners.map((w) => w.name).join(','))
    }
    expect(results.size).toBeGreaterThan(1)
  })
})

import { describe, expect, it } from 'vitest'
import { checkedInAt, guestKey, guestName, toAllocation } from './guest'

describe('Luma guest mapping', () => {
  it('prefers the full name, then first + last, then email', () => {
    expect(guestName({ user_name: 'Ana Pérez' })).toBe('Ana Pérez')
    expect(guestName({ user_first_name: 'Ana', user_last_name: 'Pérez' })).toBe('Ana Pérez')
    expect(guestName({ user_email: 'ana@example.com' })).toBe('ana@example.com')
    expect(guestName({})).toBe('Guest')
  })

  it('keys a guest by email, then user id', () => {
    expect(guestKey({ user_email: 'Ana@Example.com', user_id: 'u1' })).toBe('ana@example.com')
    expect(guestKey({ user_id: 'u1' })).toBe('u1')
  })

  it('reads checked_in_at from the guest or the earliest ticket', () => {
    expect(checkedInAt({ checked_in_at: '2026-09-14T12:00:00Z' })).toBe('2026-09-14T12:00:00Z')
    expect(
      checkedInAt({
        event_tickets: [{ checked_in_at: '2026-09-14T13:00:00Z' }, { checked_in_at: '2026-09-14T12:00:00Z' }]
      })
    ).toBe('2026-09-14T12:00:00Z')
    expect(checkedInAt({})).toBeNull()
  })

  it('only allocates guests who actually checked in', () => {
    expect(toAllocation({ user_email: 'a@b.c', user_name: 'Ana' })).toBeNull()
    expect(toAllocation({ user_email: 'a@b.c', user_name: 'Ana', checked_in_at: '2026-09-14T12:00:00Z' })).toEqual({
      key: 'a@b.c',
      name: 'Ana',
      checkedInAt: '2026-09-14T12:00:00Z',
      at: '2026-09-14T12:00:00Z'
    })
  })
})

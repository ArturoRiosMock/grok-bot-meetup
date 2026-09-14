/** Shape the wall already consumes from `/wall/state`. */
export type Allocation = {
  key: string
  name: string
  checkedInAt: string | null
  at: string
}

export type LumaGuestRaw = {
  id?: string
  user_id?: string
  user_email?: string
  user_name?: string
  user_first_name?: string
  user_last_name?: string
  checked_in_at?: string | null
  approval_status?: string
  event_tickets?: Array<{ checked_in_at?: string | null }>
}

export function guestName(raw: LumaGuestRaw): string {
  const composed = [raw.user_first_name, raw.user_last_name].filter(Boolean).join(' ')
  return raw.user_name || composed || raw.user_email || 'Guest'
}

export function guestKey(raw: LumaGuestRaw): string {
  return String(raw.user_email || raw.user_id || raw.id || '').toLowerCase()
}

export function checkedInAt(raw: LumaGuestRaw): string | null {
  const tickets = raw.event_tickets || []
  return (
    raw.checked_in_at ||
    tickets
      .map((t) => t.checked_in_at)
      .filter((x): x is string => Boolean(x))
      .sort()[0] ||
    null
  )
}

export function toAllocation(raw: LumaGuestRaw): Allocation | null {
  const key = guestKey(raw)
  const at = checkedInAt(raw)
  if (!key || !at) return null
  return { key, name: guestName(raw), checkedInAt: at, at }
}

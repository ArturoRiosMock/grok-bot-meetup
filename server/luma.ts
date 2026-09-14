import { toAllocation, type Allocation, type LumaGuestRaw } from '../src/meetup/guest'

const LUMA = 'https://public-api.luma.com'

export type LumaEnv = {
  apiKey: string
  eventId: string
}

export type WallHealth = {
  configured: boolean
  ok: boolean
  event: { id: string; name: string } | null
  checkedIn: number
  error: string
  lastSync: number
}

export type WallState = {
  allocations: Allocation[]
  luma: WallHealth
}

type Cache = { key: string; at: number; state: WallState }

let cache: Cache | null = null

export function invalidateLuma() {
  cache = null
}

async function lumaGet(apiKey: string, path: string, query: Record<string, string | undefined> = {}) {
  const url = new URL(LUMA + path)
  for (const [k, v] of Object.entries(query)) {
    if (v) url.searchParams.set(k, v)
  }
  const r = await fetch(url, { headers: { 'x-luma-api-key': apiKey, accept: 'application/json' } })
  const body = (await r.json().catch(() => ({}))) as { message?: string; event?: { id: string; name: string }; entries?: unknown[] }
  if (!r.ok) throw new Error(`Luma ${r.status} ${body.message || ''}`.trim())
  return body
}

async function resolveEvent(env: LumaEnv) {
  if (env.eventId) {
    const j = await lumaGet(env.apiKey, '/v1/events/get', { event_id: env.eventId })
    const ev = j.event || (j as { id?: string; name?: string })
    if (!ev.id) throw new Error('event not found')
    return { id: ev.id, name: ev.name || ev.id }
  }
  const after = new Date(Date.now() - 18 * 3600e3).toISOString()
  const j = await lumaGet(env.apiKey, '/v1/calendars/events/list', {
    after,
    pagination_limit: '10',
    sort_column: 'start_at',
    sort_direction: 'asc'
  })
  const ev = ((j.entries || []) as Array<{ event?: { id: string; name: string }; id?: string; name?: string }>)
    .map((e) => e.event || e)
    .find((e) => e.id)
  if (!ev?.id) throw new Error('no upcoming events on this calendar')
  return { id: ev.id, name: ev.name || ev.id }
}

async function listCheckedIn(apiKey: string, eventId: string): Promise<Allocation[]> {
  const allocations: Allocation[] = []
  let cursor: string | undefined
  for (let page = 0; page < 20; page++) {
    const j = await lumaGet(apiKey, '/v1/events/guests/list', {
      event_id: eventId,
      approval_status: 'approved',
      pagination_limit: '50',
      sort_column: 'checked_in_at',
      sort_direction: 'desc nulls last',
      pagination_cursor: cursor
    })
    const entries = (j.entries || []) as LumaGuestRaw[]
    for (const raw of entries) {
      const a = toAllocation(raw)
      if (a) allocations.push(a)
      else if (page === 0) {
        // sorted by checked_in_at desc: first page without a stamp means we are done
      }
    }
    const next = (j as { next_cursor?: string; has_more?: boolean }).next_cursor
    if (!next || !(j as { has_more?: boolean }).has_more) break
    if (entries.every((e) => !toAllocation(e))) break
    cursor = next
  }
  return allocations
}

export async function readWallState(env: LumaEnv, eventOverride = ''): Promise<WallState> {
  const eventId = eventOverride.trim() || env.eventId
  const cacheKey = `${env.apiKey ? 'k' : 'n'}:${eventId}`
  if (cache && cache.key === cacheKey && Date.now() - cache.at < 2500) return cache.state

  if (!env.apiKey) {
    const state: WallState = {
      allocations: [],
      luma: { configured: false, ok: false, event: null, checkedIn: 0, error: '', lastSync: 0 }
    }
    cache = { key: cacheKey, at: Date.now(), state }
    return state
  }

  try {
    const event = await resolveEvent({ ...env, eventId })
    const allocations = await listCheckedIn(env.apiKey, event.id)
    const state: WallState = {
      allocations,
      luma: {
        configured: true,
        ok: true,
        event,
        checkedIn: allocations.length,
        error: '',
        lastSync: Date.now()
      }
    }
    cache = { key: cacheKey, at: Date.now(), state }
    return state
  } catch (e) {
    const state: WallState = {
      allocations: cache?.state.allocations || [],
      luma: {
        configured: true,
        ok: false,
        event: cache?.state.luma.event || null,
        checkedIn: cache?.state.luma.checkedIn || 0,
        error: e instanceof Error ? e.message : String(e),
        lastSync: cache?.state.luma.lastSync || 0
      }
    }
    cache = { key: cacheKey, at: Date.now(), state }
    return state
  }
}

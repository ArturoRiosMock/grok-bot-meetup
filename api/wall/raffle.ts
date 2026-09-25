import { readWallState } from '../../server/luma.js'

type Req = { query?: Record<string, string | string[] | undefined> }
type Res = { status: (n: number) => { json: (o: unknown) => void } }

export type RaffleCandidate = {
  name: string
  avatar: string | null
}

const DEMO_NAMES = [
  'Ana García', 'Carlos Silva', 'María López', 'Pedro Santos',
  'Lucía Fernández', 'Diego Martín', 'Sofía Rodríguez', 'Juan Pérez',
  'Valentina Costa', 'Mateo Oliveira', 'Camila Souza', 'Lucas Almeida'
]

export default async function handler(req: Req, res: Res) {
  const event = String(req.query?.event || '')
  const env = {
    apiKey: process.env.LUMA_API_KEY || '',
    eventId: process.env.LUMA_EVENT_ID || ''
  }
  const state = await readWallState(env, event)

  let candidates: RaffleCandidate[]
  if (state.luma.configured && state.allocations.length > 0) {
    candidates = state.allocations.map((a) => ({
      name: a.name,
      avatar: null
    }))
  } else {
    candidates = DEMO_NAMES.map((name) => ({ name, avatar: null }))
  }

  res.status(200).json({
    candidates,
    event: state.luma.event,
    isDemo: !state.luma.configured || state.allocations.length === 0,
    total: candidates.length
  })
}

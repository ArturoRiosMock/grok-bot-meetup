import { readWallState } from '../../server/luma.js'

type Req = { query?: Record<string, string | string[] | undefined> }
type Res = { status: (n: number) => { json: (o: unknown) => void } }

export default async function handler(req: Req, res: Res) {
  const event = String(req.query?.event || '')
  const env = {
    apiKey: process.env.LUMA_API_KEY || '',
    eventId: process.env.LUMA_EVENT_ID || ''
  }
  const state = await readWallState(env, event)
  res.status(200).json(state.luma)
}

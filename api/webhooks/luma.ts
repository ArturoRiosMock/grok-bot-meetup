import { invalidateLuma } from '../../server/luma'

type Res = { status: (n: number) => { json: (o: unknown) => void } }

export default async function handler(_req: unknown, res: Res) {
  invalidateLuma()
  res.status(200).json({ ok: true })
}

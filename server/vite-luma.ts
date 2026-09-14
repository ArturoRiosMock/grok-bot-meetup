import { loadEnv, type Plugin } from 'vite'
import { invalidateLuma, readWallState, type LumaEnv } from './luma'

function json(res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (s: string) => void }, body: unknown, code = 200) {
  res.statusCode = code
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(JSON.stringify(body))
}

export function lumaWall(): Plugin {
  return {
    name: 'luma-wall',
    configureServer(server) {
      const envFile = loadEnv(server.config.mode, server.config.root, '')
      const env = (): LumaEnv => ({
        apiKey: envFile.LUMA_API_KEY || process.env.LUMA_API_KEY || '',
        eventId: envFile.LUMA_EVENT_ID || process.env.LUMA_EVENT_ID || ''
      })

      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        if (url.pathname === '/wall/state' || url.pathname === '/wall/health') {
          const state = await readWallState(env(), url.searchParams.get('event') || '')
          return json(res, url.pathname === '/wall/health' ? state.luma : state)
        }
        if (url.pathname === '/webhooks/luma' && req.method === 'POST') {
          invalidateLuma()
          return json(res, { ok: true })
        }
        next()
      })
    }
  }
}

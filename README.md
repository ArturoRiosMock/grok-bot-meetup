# Grok Bot Meetup wall

Check-in wall for Cursor ambassadors. One URL, no city slug: open `/`, click
**Edit**, pick English or Spanish, set the city and the credits QR. Labels are
fixed and follow the language. The two venue fields are saved in that browser.

**Current event:** Grok Bot Meetup Florianópolis — Fri 25 Sep 2026, 18:00–22:00 BRT  
Venue: Founder Haus - Jurerê In, Florianópolis - SC  
Luma: https://lu.ma/c293hlgc

Forked from [jeremy-prt/bloub](https://github.com/jeremy-prt/bloub).

## Running it

```bash
pnpm install
pnpm dev
```

Then open http://localhost:5190/. ` /mendoza` still redirects here so old links
keep working.

```bash
pnpm test     # vitest
pnpm build    # vue-tsc --noEmit && vite build
```

## Configure an event

1. Open the wall on the venue machine.
2. Click **Edit** (or `?setup` in the URL).
3. Set the city and the Cursor redeem URL. The QR is generated from that URL.
4. Click **Done**.

Space still fires a demo check-in.

Live check-ins come from Luma. The API key is **not** in the Edit panel:

1. Copy `.env.example` to `.env`.
2. Paste `LUMA_API_KEY` (Luma → Settings → Developer → API Keys).
3. Optional: `LUMA_EVENT_ID=evt-…`.
4. Restart `pnpm dev`.
5. Open the wall, then check someone in on Luma. The bubble should read
   `Welcome, Ana` — never `Bienvenido`.

On Vercel, set the same two env vars. The webhook URL is
`https://<host>/webhooks/luma` (`guest.updated`); polling every 2s is enough
to rehearse without a tunnel.

## Change the Vercel URL

The project is deployed at `grok-bot-meetup-beta.vercel.app`. To change the
host, add a Vercel alias (Project → Settings → Domains), then update the three
absolute URLs in `index.html` (`canonical`, `og:url`, `og:image`).

## What's in it

`src/meetup/` is the wall config: English defaults, `localStorage`, QR. The
avatar engine in `src/bot/` is untouched. Vue 3, Vite, TypeScript, Tailwind 4.
`vue-tsc` is the only gate — run `pnpm build` before you call something done.

## License

MIT. See [LICENSE](LICENSE). Not affiliated with x.ai or Cursor.

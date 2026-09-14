import { encode, QrCodeDataType } from 'uqr'

/** Marge du SVG d'origine (`claim-qr.svg`) : zone de repos, pas un fond. */
const MARGE = 3
const ENCRE = '#111111'
const RAYON_MODULE = 0.34
const RAYON_ANNEAU = 1.15
const RAYON_TROU = 0.55
const RAYON_OEIL = 0.72

/** QR only for a real http(s) URL — a half-typed redeem link must not encode. */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function qrSvg(url: string): string | null {
  const href = url.trim()
  if (!isHttpUrl(href)) return null
  const { data, size, types } = encode(href, { border: 0 })
  const vue = size + MARGE * 2
  const pieces: string[] = [
    finder(MARGE, MARGE),
    finder(MARGE + size - 7, MARGE),
    finder(MARGE, MARGE + size - 7)
  ]
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!data[y]![x]) continue
      if (types[y]![x] === QrCodeDataType.Position) continue
      pieces.push(
        `<rect x="${x + MARGE}" y="${y + MARGE}" width="1" height="1" rx="${RAYON_MODULE}" ry="${RAYON_MODULE}"/>`
      )
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vue} ${vue}" fill="${ENCRE}">${pieces.join('')}</svg>`
}

export function qrDataUrl(url: string): string | null {
  const svg = qrSvg(url)
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : null
}

/** Carre arrondi, meme trace que les viseurs du SVG mesure. */
function carreArrondi(x: number, y: number, cote: number, r: number): string {
  const x1 = x + r
  const x2 = x + cote - r
  const y2 = y + cote - r
  const xm = x + cote
  const ym = y + cote
  return `M ${x1} ${y} H ${x2} A ${r} ${r} 0 0 1 ${xm} ${y + r} V ${y2} A ${r} ${r} 0 0 1 ${x2} ${ym} H ${x1} A ${r} ${r} 0 0 1 ${x} ${y2} V ${y + r} A ${r} ${r} 0 0 1 ${x1} ${y} Z`
}

function finder(x: number, y: number): string {
  const anneau = carreArrondi(x, y, 7, RAYON_ANNEAU)
  const trou = carreArrondi(x + 1, y + 1, 5, RAYON_TROU)
  return `<path fill-rule="evenodd" d="${anneau} ${trou}"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${RAYON_OEIL}" ry="${RAYON_OEIL}"/>`
}

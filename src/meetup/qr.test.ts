import { describe, expect, it } from 'vitest'
import { isHttpUrl, qrDataUrl, qrSvg } from './qr'

describe('claim QR', () => {
  it('accepts only http(s) URLs', () => {
    expect(isHttpUrl('https://cursor.com/redeem/event/demo')).toBe(true)
    expect(isHttpUrl('http://localhost:5190/')).toBe(true)
    expect(isHttpUrl('cursor.com/redeem')).toBe(false)
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(isHttpUrl('')).toBe(false)
  })

  it('renders an SVG only for a real URL', () => {
    const svg = qrSvg('https://cursor.com/redeem/event/demo')
    expect(svg).toMatch(/^<svg /)
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    expect(qrSvg('not-a-url')).toBeNull()
    expect(qrDataUrl('https://cursor.com/redeem/event/demo')).toMatch(
      /^data:image\/svg\+xml;charset=utf-8,/
    )
  })

  it('keeps the measured rounded modules and no paper fill', () => {
    const svg = qrSvg('https://cursor.com/redeem/event/grok-bot-meetup-mendoza')
    expect(svg).toContain('rx="0.34"')
    expect(svg).toContain('fill-rule="evenodd"')
    expect(svg).toContain('rx="0.72"')
    expect(svg).not.toMatch(/fill="#(fff|ffffff|FFF|FFFFFF)"/i)
    expect(svg).not.toContain('whiteColor')
  })
})

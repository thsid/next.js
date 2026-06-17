import { nextTestSetup } from 'e2e-utils'
import { retry } from 'next-test-utils'

describe('app dir - service worker (one worker per scope)', () => {
  const { next, isTurbopack } = nextTestSetup({
    files: __dirname,
  })

  if (!isTurbopack) {
    it('skips on webpack', () => {})
    return
  }

  it('serves one worker per scope at scope-derived file names', async () => {
    const browser = await next.browser('/')

    await retry(async () => {
      expect(await browser.elementByCss('#root-scope').text()).toBe('/')
    })
    await retry(async () => {
      expect(await browser.elementByCss('#offline-scope').text()).toBe(
        '/offline/mode'
      )
    })

    // scope "/" -> /sw.js, scope "/offline/mode" -> /sw-offline-mode.js
    // Both are served as mutable, always-revalidated assets (never immutable).
    const root = await next.fetch('/sw.js')
    expect(root.status).toBe(200)
    expect(root.headers.get('cache-control')).toContain('max-age=0')
    expect(root.headers.get('cache-control')).not.toContain('immutable')

    const offline = await next.fetch('/sw-offline-mode.js')
    expect(offline.status).toBe(200)
    expect(offline.headers.get('cache-control')).toContain('max-age=0')
    expect(offline.headers.get('cache-control')).not.toContain('immutable')
  })
})

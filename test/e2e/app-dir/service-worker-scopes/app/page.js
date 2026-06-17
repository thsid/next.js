'use client'
import { useEffect, useState } from 'react'

export default function Page() {
  const [rootScope, setRootScope] = useState('default')
  const [offlineScope, setOfflineScope] = useState('default')

  useEffect(() => {
    async function run() {
      // Two different workers at two different scopes — both are allowed and are
      // served at distinct, scope-derived file names (/sw.js and /sw-offline-mode.js).
      const root = await navigator.serviceWorker.register(
        new URL('../lib/pwa-root', import.meta.url)
      )
      setRootScope(new URL(root.scope).pathname)

      const offline = await navigator.serviceWorker.register(
        new URL('../lib/pwa-offline', import.meta.url),
        { scope: '/offline/mode' }
      )
      setOfflineScope(new URL(offline.scope).pathname)
    }

    run().catch((err) => {
      setRootScope('error: ' + err.message)
      setOfflineScope('error: ' + err.message)
    })
  }, [])

  return (
    <div>
      <p id="root-scope">{rootScope}</p>
      <p id="offline-scope">{offlineScope}</p>
    </div>
  )
}

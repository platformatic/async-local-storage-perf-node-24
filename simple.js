import { createServer } from 'node:http'
import { AsyncLocalStorage } from 'node:async_hooks'

const asyncLocalStorage = new AsyncLocalStorage()

const server = createServer((req, res) => {
  asyncLocalStorage.run(new Map(), () => {
    const store = asyncLocalStorage.getStore()
    store.set('requestId', Math.random().toString(36).substring(2, 15))
    
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(`Request ID: ${store.get('requestId')}\n`)
  })
})

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})


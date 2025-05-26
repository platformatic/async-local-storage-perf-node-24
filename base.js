import { createServer } from 'node:http'


const server = createServer((req, res) => {
  const requestId = Math.random().toString(36).substring(2, 15)

  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(`Request ID: ${requestId}\n`)
})

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})


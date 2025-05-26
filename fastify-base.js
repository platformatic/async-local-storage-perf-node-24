import fastify from "fastify";

const app = fastify();

// automatically all your routes will be instrumented
app.get('/', () => 'hello world')

await app.listen({ port: 3000 })

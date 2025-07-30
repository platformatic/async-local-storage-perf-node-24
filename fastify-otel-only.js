import { NodeSDK } from '@opentelemetry/sdk-node';
import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics';
import FastifyOtelInstrumentation from '@fastify/otel';
import fastify from 'fastify';

// If serverName is not provided, it will fallback to OTEL_SERVICE_NAME
// as per https://opentelemetry.io/docs/languages/sdk-configuration/general/.
const fastifyOtelInstrumentation = new FastifyOtelInstrumentation({ servername: 'foo' });

const sdk = new NodeSDK({
  // traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [fastifyOtelInstrumentation],
});

sdk.start();

const app = fastify();

await app.register(fastifyOtelInstrumentation.plugin());

// automatically all your routes will be instrumented
app.get('/', () => 'hello world')

await app.listen({ port: 3000 })

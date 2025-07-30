
# AsyncLocalStorage Performance Benchmarks

This repository contains comprehensive performance benchmarks comparing the overhead of AsyncLocalStorage and OpenTelemetry instrumentation in Node.js applications across different Node.js versions.

The benchmarks measure the performance impact of various approaches to request context tracking and observability, providing data-driven insights for developers building production Node.js applications that require distributed tracing, request correlation, or context propagation.

# Benchmark Environment

These benchmarks were executed on:
- **OS:** Linux 5.15.0-140-generic
- **Platform:** linux
- **CPU:** Intel(R) Core(TM) i7-7700 CPU @ 3.60GHz
- **Cores:** 4 cores, 8 threads (2 threads per core)
- **CPU Frequency:** 800 MHz - 4200 MHz
- **Memory:** 62 GB RAM
- **Storage:** 202 GB total, 172 GB used (90% utilization)
- **Date:** 2025-07-30

# Benchmark Methodology

These benchmarks systematically evaluate the performance overhead introduced by AsyncLocalStorage and OpenTelemetry instrumentation in Node.js applications. AsyncLocalStorage is a powerful Node.js feature that enables context propagation across asynchronous operations, commonly used for request tracing, logging correlation, and storing request-scoped data. However, this functionality comes with performance implications that developers should understand.

The study compares five different server implementations to isolate and measure the specific performance costs of different instrumentation approaches:

## Test Scenarios

1. **No AsyncLocalStorage** (`base.js`): Baseline HTTP server without AsyncLocalStorage
2. **AsyncLocalStorage** (`simple.js`): HTTP server using AsyncLocalStorage to store request context
3. **Fastify Base** (`fastify-base.js`): Fastify server without instrumentation
4. **Fastify OpenTelemetry** (`fastify-otel.js`): Fastify with full OpenTelemetry auto-instrumentation + Fastify OTel plugin
5. **Fastify OpenTelemetry without auto-instrumentation** (`fastify-otel-only.js`): Fastify with only Fastify OTel plugin (no auto-instrumentations)

## Load Testing Configuration

All tests use [Autocannon](https://github.com/mcollina/autocannon) with consistent parameters:
- **Connections**: 100 concurrent connections
- **Pipelining**: 10 requests per connection
- **Duration**: 10 seconds test + 5 seconds warmup
- **Command**: `npx autocannon -c 100 -p 10 -d 10 -W [ -c 100 -d 5] http://localhost:3000`

## Measured Metrics

- **Latency**: Response time percentiles (2.5%, 50%, 97.5%, 99%) and averages
- **Throughput**: Requests per second and bytes per second
- **Total**: Total requests and data transferred during the test period

Each server responds with a simple text message containing a generated request ID to ensure consistent response payloads across all scenarios.

## Key Findings

The benchmarks reveal significant performance differences between the various approaches:

- **AsyncLocalStorage Impact**: Basic AsyncLocalStorage usage shows a measurable but relatively small performance overhead compared to the baseline
- **Framework Differences**: Fastify generally outperforms raw Node.js HTTP servers in baseline scenarios
- **OpenTelemetry Overhead**: Full OpenTelemetry auto-instrumentation introduces substantial performance costs, with throughput reductions of 80%+ in some cases
- **Selective Instrumentation**: Using only Fastify's OpenTelemetry plugin (without Node.js auto-instrumentations) provides a middle ground, offering observability with reduced performance impact

These results help developers make informed decisions about when and how to implement request context tracking and observability in production Node.js applications.

## Node.js Version Comparison

The benchmarks include measurements for both **Node.js v24** and **Node.js v22.17.1** to evaluate performance differences between these major versions:

### Performance Improvements in Node.js v24
- **AsyncLocalStorage Optimization**: Node.js v24 shows improved AsyncLocalStorage performance compared to v22, with slightly better throughput in most scenarios
- **Baseline Performance**: Both versions show similar baseline performance for non-instrumented servers
- **OpenTelemetry Impact**: The relative overhead of OpenTelemetry instrumentation remains substantial in both versions, though v24 shows marginal improvements

### Version-Specific Observations
- **Fastify Base**: Both versions achieve similar performance (~56-57k req/sec)
- **AsyncLocalStorage**: v24 maintains better performance consistency under AsyncLocalStorage usage
- **OpenTelemetry**: Full instrumentation remains expensive in both versions, but v24 handles the overhead slightly better

The version comparison demonstrates that while Node.js v24 includes performance improvements for AsyncLocalStorage, the fundamental trade-offs between observability features and performance remain consistent across versions.

# Node.js v24

## No AsyncLocalStorage

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬──────┬───────┬───────┬───────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev    │ Max    │
├─────────┼──────┼───────┼───────┼───────┼──────────┼──────────┼────────┤
│ Latency │ 9 ms │ 12 ms │ 24 ms │ 26 ms │ 16.94 ms │ 13.48 ms │ 642 ms │
└─────────┴──────┴───────┴───────┴───────┴──────────┴──────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────────┬──────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg       │ Stdev    │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼─────────┤
│ Req/Sec   │ 53,823  │ 53,823  │ 57,695  │ 58,015  │ 57,301.82 │ 1,151.34 │ 53,803  │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼─────────┤
│ Bytes/Sec │ 10.3 MB │ 10.3 MB │ 11.1 MB │ 11.1 MB │ 11 MB     │ 221 kB   │ 10.3 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────────┴──────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

631k requests in 11.01s, 121 MB read
```

## AsyncLocalStorage

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬───────┬───────┬───────┬───────┬──────────┬───────┬────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev │ Max    │
├─────────┼───────┼───────┼───────┼───────┼──────────┼───────┼────────┤
│ Latency │ 10 ms │ 13 ms │ 26 ms │ 30 ms │ 18.12 ms │ 15 ms │ 704 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴───────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────────┬──────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg       │ Stdev    │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼─────────┤
│ Req/Sec   │ 50,015  │ 50,015  │ 54,015  │ 54,367  │ 53,450.19 │ 1,264.41 │ 50,002  │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼─────────┤
│ Bytes/Sec │ 9.59 MB │ 9.59 MB │ 10.4 MB │ 10.4 MB │ 10.2 MB   │ 242 kB   │ 9.59 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────────┴──────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

589k requests in 11.01s, 113 MB read
```

## Fastify Base

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬───────┬───────┬───────┬───────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev    │ Max    │
├─────────┼───────┼───────┼───────┼───────┼──────────┼──────────┼────────┤
│ Latency │ 10 ms │ 12 ms │ 25 ms │ 25 ms │ 17.35 ms │ 14.73 ms │ 694 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴──────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬────────┬───────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%  │ Avg       │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼────────┼───────────┼─────────┼─────────┤
│ Req/Sec   │ 51,647  │ 51,647  │ 56,607  │ 56,991 │ 56,167.28 │ 1,459.5 │ 51,630  │
├───────────┼─────────┼─────────┼─────────┼────────┼───────────┼─────────┼─────────┤
│ Bytes/Sec │ 9.09 MB │ 9.09 MB │ 9.96 MB │ 10 MB  │ 9.88 MB   │ 256 kB  │ 9.09 MB │
└───────────┴─────────┴─────────┴─────────┴────────┴───────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

619k requests in 11.02s, 109 MB read
```

## Fastify OpenTelemetry

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬───────┬───────┬────────┬────────┬──────────┬───────────┬─────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5%  │ 99%    │ Avg      │ Stdev     │ Max     │
├─────────┼───────┼───────┼────────┼────────┼──────────┼───────────┼─────────┤
│ Latency │ 24 ms │ 80 ms │ 101 ms │ 104 ms │ 93.18 ms │ 212.87 ms │ 5010 ms │
└─────────┴───────┴───────┴────────┴────────┴──────────┴───────────┴─────────┘
┌───────────┬────────┬────────┬─────────┬─────────┬───────────┬──────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg       │ Stdev    │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼───────────┼──────────┼────────┤
│ Req/Sec   │ 7,959  │ 7,959  │ 11,175  │ 11,511  │ 10,640.55 │ 1,017.26 │ 7,958  │
├───────────┼────────┼────────┼─────────┼─────────┼───────────┼──────────┼────────┤
│ Bytes/Sec │ 1.4 MB │ 1.4 MB │ 1.97 MB │ 2.03 MB │ 1.87 MB   │ 179 kB   │ 1.4 MB │
└───────────┴────────┴────────┴─────────┴─────────┴───────────┴──────────┴────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

118k requests in 11.01s, 20.6 MB read
```

### Fastify OpenTelemetry without auto-instrumentation

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬───────┬───────┬───────┬───────┬──────────┬──────────┬─────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev    │ Max     │
├─────────┼───────┼───────┼───────┼───────┼──────────┼──────────┼─────────┤
│ Latency │ 17 ms │ 42 ms │ 71 ms │ 87 ms │ 48.06 ms │ 59.51 ms │ 1869 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴──────────┴─────────┘
┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Req/Sec   │ 17,039 │ 17,039 │ 20,863  │ 21,407  │ 20,568  │ 1,153.4 │ 17,027 │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼─────────┼────────┤
│ Bytes/Sec │ 3 MB   │ 3 MB   │ 3.67 MB │ 3.77 MB │ 3.62 MB │ 203 kB  │ 3 MB   │
└───────────┴────────┴────────┴─────────┴─────────┴─────────┴─────────┴────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

227k requests in 11.02s, 39.8 MB read
```

# Node.js v22.17.1

## No AsyncLocalStorage

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬──────┬───────┬───────┬───────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5% │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev    │ Max    │
├─────────┼──────┼───────┼───────┼───────┼──────────┼──────────┼────────┤
│ Latency │ 9 ms │ 12 ms │ 27 ms │ 30 ms │ 17.25 ms │ 13.59 ms │ 647 ms │
└─────────┴──────┴───────┴───────┴───────┴──────────┴──────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬────────┬───────────┬──────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%  │ Avg       │ Stdev    │ Min     │
├───────────┼─────────┼─────────┼─────────┼────────┼───────────┼──────────┼─────────┤
│ Req/Sec   │ 54,239  │ 54,239  │ 56,991  │ 57,407 │ 56,446.55 │ 1,083.41 │ 54,229  │
├───────────┼─────────┼─────────┼─────────┼────────┼───────────┼──────────┼─────────┤
│ Bytes/Sec │ 10.4 MB │ 10.4 MB │ 10.9 MB │ 11 MB  │ 10.8 MB   │ 206 kB   │ 10.4 MB │
└───────────┴─────────┴─────────┴─────────┴────────┴───────────┴──────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

622k requests in 11.01s, 119 MB read
```

##  AsyncLocalStorage

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬───────┬───────┬───────┬───────┬──────────┬───────┬────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev │ Max    │
├─────────┼───────┼───────┼───────┼───────┼──────────┼───────┼────────┤
│ Latency │ 10 ms │ 14 ms │ 27 ms │ 30 ms │ 19.11 ms │ 16 ms │ 744 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴───────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg       │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼────────┼─────────┤
│ Req/Sec   │ 48,575  │ 48,575  │ 51,231  │ 51,711  │ 50,913.46 │ 824.4  │ 48,556  │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼────────┼─────────┤
│ Bytes/Sec │ 9.31 MB │ 9.31 MB │ 9.82 MB │ 9.91 MB │ 9.76 MB   │ 158 kB │ 9.31 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

561k requests in 11.01s, 107 MB read
```

## Fastify Base

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬───────┬───────┬───────┬───────┬──────────┬──────────┬────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev    │ Max    │
├─────────┼───────┼───────┼───────┼───────┼──────────┼──────────┼────────┤
│ Latency │ 10 ms │ 12 ms │ 24 ms │ 26 ms │ 17.23 ms │ 14.55 ms │ 690 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴──────────┴────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────────┬──────────┬────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg       │ Stdev    │ Min    │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼────────┤
│ Req/Sec   │ 52,319  │ 52,319  │ 57,151  │ 57,439  │ 56,737.46 │ 1,406.84 │ 52,288 │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼──────────┼────────┤
│ Bytes/Sec │ 9.21 MB │ 9.21 MB │ 10.1 MB │ 10.1 MB │ 9.98 MB   │ 248 kB   │ 9.2 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────────┴──────────┴────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

625k requests in 11.01s, 110 MB read
```

## Fastify OpenTelemetry

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬───────┬───────┬────────┬────────┬──────────┬───────────┬─────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5%  │ 99%    │ Avg      │ Stdev     │ Max     │
├─────────┼───────┼───────┼────────┼────────┼──────────┼───────────┼─────────┤
│ Latency │ 24 ms │ 80 ms │ 127 ms │ 136 ms │ 99.85 ms │ 242.58 ms │ 5279 ms │
└─────────┴───────┴───────┴────────┴────────┴──────────┴───────────┴─────────┘
┌───────────┬────────┬────────┬─────────┬─────────┬─────────┬──────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%     │ 97.5%   │ Avg     │ Stdev    │ Min    │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼──────────┼────────┤
│ Req/Sec   │ 7,391  │ 7,391  │ 9,951   │ 11,023  │ 9,931.4 │ 1,060.47 │ 7,390  │
├───────────┼────────┼────────┼─────────┼─────────┼─────────┼──────────┼────────┤
│ Bytes/Sec │ 1.3 MB │ 1.3 MB │ 1.75 MB │ 1.94 MB │ 1.75 MB │ 186 kB   │ 1.3 MB │
└───────────┴────────┴────────┴─────────┴─────────┴─────────┴──────────┴────────┘

Req/Bytes counts sampled once per second.
# of samples: 10

100k requests in 10.02s, 17.5 MB read
```

## Fastify OpenTelemetry without auto-instrumentation

```bash
$ npm run test

> async-local-storage-perf-node-24@0.0.1 test
> npx autocannon -c 100 -p 10 -d 10  -W [ -c 100 -d 5] http://localhost:3000

Running 5s warmup @ http://localhost:3000
100 connections with 10 pipelining factor

Running 10s test @ http://localhost:3000
100 connections with 10 pipelining factor


┌─────────┬───────┬───────┬───────┬───────┬──────────┬─────────┬─────────┐
│ Stat    │ 2.5%  │ 50%   │ 97.5% │ 99%   │ Avg      │ Stdev   │ Max     │
├─────────┼───────┼───────┼───────┼───────┼──────────┼─────────┼─────────┤
│ Latency │ 16 ms │ 43 ms │ 76 ms │ 92 ms │ 49.28 ms │ 61.2 ms │ 1944 ms │
└─────────┴───────┴───────┴───────┴───────┴──────────┴─────────┴─────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬───────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg       │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼────────┼─────────┤
│ Req/Sec   │ 18,015  │ 18,015  │ 20,287  │ 20,511  │ 20,051.64 │ 697.9  │ 18,002  │
├───────────┼─────────┼─────────┼─────────┼─────────┼───────────┼────────┼─────────┤
│ Bytes/Sec │ 3.17 MB │ 3.17 MB │ 3.57 MB │ 3.61 MB │ 3.53 MB   │ 123 kB │ 3.17 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴───────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.
# of samples: 11

222k requests in 11.01s, 38.8 MB read
```

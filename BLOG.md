# The Hidden Cost of Context: AsyncLocalStorage and OpenTelemetry Performance in Node.js

*How much does request tracing really cost your Node.js application? We ran the numbers.*

Modern Node.js applications increasingly rely on context propagation for distributed tracing, request correlation, and observability. Features like AsyncLocalStorage and OpenTelemetry have become essential tools for understanding application behavior in production. But what's the real performance cost?

We conducted comprehensive benchmarks comparing the overhead of AsyncLocalStorage and OpenTelemetry instrumentation across Node.js v22.17.1 and v24.4.1, testing five different server configurations to isolate and measure the specific performance costs of different instrumentation approaches.

## The Great Context Performance Investigation

Context propagation in Node.js has always been challenging. Before AsyncLocalStorage, developers resorted to complex continuation-local-storage libraries or manual context passing through callback chains. AsyncLocalStorage, introduced as a stable feature, promised a cleaner solution – but at what cost?

Our investigation started with a simple question: *"How much performance do we sacrifice for observability?"*

## The Test Laboratory

We created a controlled environment to answer this question scientifically:

**Hardware Specs:**
- Intel(R) Core(TM) i7-7700 CPU @ 3.60GHz (4 cores, 8 threads)
- 62 GB RAM
- Linux 5.15.0-140-generic

**Load Testing Configuration:**
- 100 concurrent connections
- 10 requests per connection (pipelining)
- 10-second test duration with 5-second warmup
- Consistent payloads across all scenarios

## The Contestants

We benchmarked five different server implementations:

1. **Baseline** (`base.js`): Pure Node.js HTTP server without AsyncLocalStorage
2. **AsyncLocalStorage** (`simple.js`): HTTP server using AsyncLocalStorage for request context
3. **Fastify Base** (`fastify-base.js`): Fastify server without instrumentation
4. **Fastify + Full OpenTelemetry** (`fastify-otel.js`): Complete observability stack with auto-instrumentation
5. **Fastify + Selective OpenTelemetry** (`fastify-otel-only.js`): Only Fastify's OpenTelemetry plugin

## The Shocking Results

### Node.js v24.4.1 Performance Showdown

| Scenario | Requests/sec (Avg) | Latency (P99) | Performance vs Baseline |
|----------|-------------|---------------|----------------------|
| **Baseline** | 57,301 | 26ms | 100% |
| **AsyncLocalStorage** | 53,450 | 30ms | **93.3%** |
| **Fastify Base** | 56,167 | 25ms | 98.0% |
| **Fastify + Full OTel** | 10,640 | 104ms | **18.6%** 😱 |
| **Fastify + Selective OTel** | 20,568 | 87ms | 35.9% |

### Node.js v22.17.1 Performance Comparison

| Scenario | Requests/sec (Avg) | Latency (P99) | Performance vs Baseline |
|----------|-------------|---------------|----------------------|
| **Baseline** | 56,446 | 30ms | 100% |
| **AsyncLocalStorage** | 50,913 | 30ms | **90.2%** |
| **Fastify Base** | 56,737 | 26ms | 100.5% |
| **Fastify + Full OTel** | 9,931 | 136ms | **17.6%** 😱 |
| **Fastify + Selective OTel** | 20,051 | 92ms | 35.5% |

### The AsyncLocalStorage Tax

The numbers tell a clear story:

- **AsyncLocalStorage overhead**: ~7% performance reduction
- **Framework efficiency**: Fastify matches raw Node.js performance
- **Full observability cost**: **81% performance reduction** 
- **Selective instrumentation**: A middle ground at ~36% of baseline performance

## The Node.js v24 Advantage

Here's where it gets interesting. Node.js v24 shows measurable improvements over v22, thanks to specific optimizations:

### AsyncLocalStorage Optimizations

Node.js v24 includes critical AsyncLocalStorage performance improvements from:
- [PR #48528](https://github.com/nodejs/node/pull/48528) (sponsored by DataDog)
- [PR #55552](https://github.com/nodejs/node/pull/55552)

### Detailed Performance Gains by Scenario

Here's how Node.js v24.4.1 performs compared to v22.17.1 across all test cases:

| Scenario | Node.js v22 | Node.js v24 | Performance Gain |
|----------|-------------|-------------|------------------|
| **Baseline** | 56,446 req/sec | 57,301 req/sec | **+1.5%** |
| **AsyncLocalStorage** | 50,913 req/sec | 53,450 req/sec | **+5.0%** 🎯 |
| **Fastify Base** | 56,737 req/sec | 56,167 req/sec | -1.0% |
| **Fastify + Full OTel** | 9,931 req/sec | 10,640 req/sec | **+7.1%** |
| **Fastify + Selective OTel** | 20,051 req/sec | 20,568 req/sec | **+2.6%** |

**Key Insights:**
- **AsyncLocalStorage sees the biggest improvement**: 5% better throughput directly benefits context-heavy applications
- **OpenTelemetry scenarios also improve**: Even with heavy instrumentation, v24 shows measurable gains
- **Baseline performance**: Slight improvement in raw HTTP performance
- **Fastify baseline**: Minor regression, likely within margin of error

The AsyncLocalStorage improvement is particularly significant because it's where most real-world applications will see direct benefits when upgrading to Node.js v24.4.1.

## The OpenTelemetry Reality Check

The most striking finding? **Full OpenTelemetry auto-instrumentation carries a massive performance penalty.**

In our tests, enabling complete OpenTelemetry instrumentation reduced throughput by over 80%. This isn't necessarily a flaw – comprehensive observability requires extensive monitoring hooks throughout the application lifecycle.

However, the selective approach (Fastify OTel plugin only) offers a more balanced trade-off:
- Still provides distributed tracing capabilities
- Reduces performance impact to ~65% instead of ~81%
- Maintains essential observability features

## Real-World Implications

### For Production Applications

**If you need AsyncLocalStorage:**
- Budget for ~7% performance overhead
- Node.js v24 provides better performance than v22
- The benefits often outweigh the costs for request correlation

**If you need OpenTelemetry:**
- Full auto-instrumentation: Expect significant performance impact
- Consider selective instrumentation for better performance
- Profile your specific use case – YMMV based on application complexity

**If performance is critical:**
- Measure the impact in your specific environment
- Consider whether observability benefits justify the performance cost
- Implement smart sampling strategies to reduce overhead

### The Developer's Dilemma

This creates an interesting trade-off matrix:

| Scenario | Performance | Observability | Complexity |
|----------|-------------|---------------|------------|
| No instrumentation | ⭐⭐⭐⭐⭐ | ⭐ | ⭐ |
| AsyncLocalStorage only | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐ |
| Selective OTel | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Full OTel | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

## The Bottom Line

**AsyncLocalStorage is remarkably efficient** for what it provides. A ~7% performance cost for robust context propagation is reasonable for most applications.

**OpenTelemetry's comprehensive instrumentation is expensive** but provides unparalleled observability. The key is choosing the right level of instrumentation for your needs.

**Node.js v24 delivers meaningful improvements** for AsyncLocalStorage performance, making the upgrade worthwhile for context-heavy applications.

## Moving Forward

These benchmarks highlight the importance of measuring observability costs in your specific environment. While our results provide valuable baselines, your application's performance characteristics may differ.

**Recommendations:**
1. **Start minimal**: Begin with basic AsyncLocalStorage for request correlation
2. **Measure continuously**: Profile observability overhead in your production environment  
3. **Upgrade strategically**: Node.js v24's AsyncLocalStorage improvements justify upgrading
4. **Choose wisely**: Balance observability needs against performance requirements

The future of Node.js observability looks bright, with continued performance optimizations (thanks to contributors and sponsors like DataDog) making context propagation increasingly viable for high-performance applications.

---

*Want to run these benchmarks yourself? Check out the [complete benchmark suite](https://github.com/platformatic/async-local-storage-perf-node-24) with all test scenarios and detailed results.*

*Have questions about Node.js performance optimization? Let's discuss the trade-offs between observability and performance in your specific use case.*

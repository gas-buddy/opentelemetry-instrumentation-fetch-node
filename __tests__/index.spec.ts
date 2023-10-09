import http from 'http';
import { expect, test, vi } from 'vitest';
import { ReadableSpan, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '../src';
import { SpanStatusCode } from '@opentelemetry/api';

test('Basic function', async () => {
  const provider = new NodeTracerProvider({});
  const exportedSpans: ReadableSpan[] = [];

  provider.addSpanProcessor(
    new SimpleSpanProcessor({
      export(spans, resultCallback) {
        exportedSpans.push(...spans);
        resultCallback({ code: 0 });
      },
      shutdown: vi.fn(),
    }),
  );
  provider.register();

  const config = {
    onRequest: vi.fn(),
  };

  registerInstrumentations({
    instrumentations: [new FetchInstrumentation(config)],
    tracerProvider: provider,
  });

  const server = http.createServer((req, res) => {
    expect(req.headers.traceparent).toBeTruthy();
    if (req.headers['x-error']) {
      res.writeHead(500);
    } else {
      res.setHeader('Content-Length', '2');
      res.writeHead(200);
    }
    res.end('OK');
    res.destroy();
  });
  await new Promise<void>((accept) => {
    server.listen(12345, accept);
  });

  await fetch('http://localhost:12345');
  expect(config.onRequest).toHaveBeenCalledTimes(1);
  await fetch('http://localhost:12345', { headers: { 'x-error': '1' } });
  expect(config.onRequest).toHaveBeenCalledTimes(2);

  await new Promise<void>((accept, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        accept();
      }
    });
  });

  try {
    await fetch('http://localhost:12345');
    throw new Error('Expected fetch exception');
  } catch (e) {
    expect(config.onRequest).toHaveBeenCalledTimes(3);
  }

  expect(exportedSpans.length).toBe(3);
  expect(exportedSpans[0].status.code).toEqual(SpanStatusCode.OK);
  expect(exportedSpans[1].status.code).toEqual(SpanStatusCode.ERROR);
  expect(exportedSpans[1].status.message).toMatch(/500/);
  expect(exportedSpans[2].status.code).toEqual(SpanStatusCode.ERROR);
  expect(exportedSpans[2].status.message).toMatch(/ECONNREFUSED/);
});

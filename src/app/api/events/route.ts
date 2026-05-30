import { subscribe, unsubscribe, heartbeat } from '@/lib/sse'

export const dynamic = 'force-dynamic'

export async function GET() {
  let controller: ReadableStreamDefaultController<Uint8Array>
  let intervalId: ReturnType<typeof setInterval>

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c
      subscribe(controller)
      // Send a heartbeat every 15 seconds to keep the connection alive
      intervalId = setInterval(() => heartbeat(), 15_000)
    },
    cancel() {
      clearInterval(intervalId)
      unsubscribe(controller)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

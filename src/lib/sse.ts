import type { SSEEvent } from '@/types/api'

type Controller = ReadableStreamDefaultController<Uint8Array>

const controllers = new Set<Controller>()
const encoder = new TextEncoder()

export function subscribe(controller: Controller): void {
  controllers.add(controller)
}

export function unsubscribe(controller: Controller): void {
  controllers.delete(controller)
}

export function broadcast(event: SSEEvent): void {
  const payload = encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
  for (const controller of controllers) {
    try {
      controller.enqueue(payload)
    } catch {
      controllers.delete(controller)
    }
  }
}

export function heartbeat(): void {
  const payload = encoder.encode(': heartbeat\n\n')
  for (const controller of controllers) {
    try {
      controller.enqueue(payload)
    } catch {
      controllers.delete(controller)
    }
  }
}

export function connectionCount(): number {
  return controllers.size
}

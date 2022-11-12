import { Server, RequestListener } from "http"

interface MockServer extends Server {
  __handler: RequestListener
}

const serverFactory = (handler: RequestListener): MockServer => {
  return {
    __handler: handler,
    on: () => {},
    once: () => {},
    removeListener: () => {},
    address: () => "0.0.0.0",
    listen: (_: unknown, cb: () => void) => {
      cb()
    },
  } as any
}

type Output = (options: object) => Promise<RequestListener>
type FastifyBuilder = (options: object) => any

const fastifyHandler =
  (fastifyBuilder: FastifyBuilder): Output =>
  (options = {}) => {
    const app = fastifyBuilder({ ...options, serverFactory })
    return app.listen(0).then(() => app.server.__handler)
  }

export default fastifyHandler

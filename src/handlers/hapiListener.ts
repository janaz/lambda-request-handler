import { EventEmitter } from "events"
import { IncomingMessage, ServerResponse } from "http"

type Callback = () => void

export class HapiListener extends EventEmitter {
  listen(_port: any, maybeCallback?: any, maybeCallback2?: any) {
    let callback: Callback | undefined =
      typeof maybeCallback === "function" ? maybeCallback : undefined
    if (!callback) {
      callback =
        typeof maybeCallback2 === "function" ? maybeCallback2 : undefined
    }
    if (callback) {
      callback()
    }
  }

  get handler() {
    return (req: IncomingMessage, res: ServerResponse) =>
      this.emit("request", req, res)
  }
}

import { info } from "@postfmly/logger"

import getPort from "get-port"
import { status } from "http-status"

const DEBUG: boolean = Bun.env.IS_DEBUG === "true"

let SERVER: Bun.Server<undefined> | null = null

let NAME: string = ""

let PORT: number = 0

interface ITest {
  NAME: string
  PORT: number
}

let forTesting: ITest | null = null

const server = async (): Promise<void> => {
  if (!Bun.env.LOGO_NAME.length) {
    throw new Error("Invalid LOGO_NAME")
  }

  NAME = `/${Bun.env.LOGO_NAME}`

  PORT = isNaN(Number(Bun.env.LOGO_PORT))
    ? await getPort({
        host: Bun.env.LOGO_IPv6 === "true" ? "::" : "0.0.0.0"
      })
    : Number(Bun.env.LOGO_PORT)

  SERVER = Bun.serve({
    development: Bun.env.NODE_ENV !== "production",
    port: PORT,
    fetch(request: Request): Response {
      const req: string = new URL(request.url).pathname
      if (req === NAME) {
        return new Response(Bun.file(`${Bun.env.LOGO_PATH}${NAME}`))
      } else if (req === "/favicon.ico") {
        return new Response(null, {
          status: status.NO_CONTENT
        })
      }
      return new Response(status[404], {
        status: status.NOT_FOUND
      })
    }
  })

  if (Bun.env.NODE_ENV === "test") {
    forTesting = {
      NAME: NAME,
      PORT: PORT
    } as ITest
  }
}

const startLogoServer = async (): Promise<void> => {
  if (!SERVER) {
    await server()

    if (DEBUG) {
      info(`Logo server started on port ${PORT}`)
    }
  } else if (DEBUG) {
    info("Logo server already started")
  }
}

const stopLogoServer = async (): Promise<void> => {
  if (SERVER) {
    await SERVER.stop()

    SERVER = null

    if (DEBUG) {
      info("Logo server stopped")
    }
  } else if (DEBUG) {
    info("Logo server already stopped")
  }
}

export { forTesting, startLogoServer, stopLogoServer }

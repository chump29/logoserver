import { info } from "@postfmly/logger"

import { default as getPort } from "get-port"
import { status } from "http-status"

const DEBUG: boolean = Bun.env.IS_DEBUG === "true"

let SERVER: Bun.Server<undefined> | null = null

let LOGO_NAME: string | undefined = undefined
let LOGO2_NAME: string | undefined = undefined

let PORT: number = 0

interface ITest {
  LOGO_NAME: string
  LOGO2_NAME: string
  PORT: number
}

let forTesting: ITest | null = null

const LEADING_SLASH: RegExp = /^\//

const server = async (): Promise<void> => {
  if (!Bun.env.LOGO_NAME) {
    throw new Error("Invalid LOGO_NAME")
  }

  LOGO_NAME = Bun.env.LOGO_NAME
  LOGO2_NAME = Bun.env.LOGO2_NAME

  PORT = isNaN(Number(Bun.env.LOGO_PORT))
    ? await getPort({
        host: Bun.env.LOGO_IPV6 === "true" ? "::" : "0.0.0.0"
      })
    : Number(Bun.env.LOGO_PORT)

  SERVER = Bun.serve({
    development: Bun.env.NODE_ENV !== "production",
    port: PORT,
    fetch(request: Request): Response {
      const req: string = new URL(request.url).pathname.replace(LEADING_SLASH, "")
      if (req === LOGO_NAME) {
        return new Response(Bun.file(`${Bun.env.LOGO_PATH}/${LOGO_NAME}`))
      } else if (LOGO2_NAME && req === LOGO2_NAME) {
        return new Response(Bun.file(`${Bun.env.LOGO2_PATH}/${LOGO2_NAME}`))
      } else if (req === "favicon.ico") {
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
      LOGO_NAME: LOGO_NAME,
      LOGO2_NAME: LOGO2_NAME,
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

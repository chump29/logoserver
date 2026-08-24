import { file, type Server, serve } from "bun"

import { info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { default as getPort } from "get-port"
import { status } from "http-status"

import { default as env } from "./env.config.ts"

// biome-ignore lint/nursery/useExplicitType: narrowed
const { DEBUG, LOGO_NAME, LOGO_PORT, LOGO_IPV6, NODE_ENV, LOGO_PATH, LOGO2_NAME, LOGO2_PATH } = env

let SERVER: Nullable<Server<undefined>> = null

let PORT: number = 0

let testingPort: Nullable<number> = null

const ext: string[] = [".png", ".webp", ".jpg", ".jpeg"]

const server = async (): Promise<void> => {
  if (!ext.some((e: string): boolean => LOGO_NAME.endsWith(e))) {
    await stopLogoServer()
    throw new Error("Invalid LOGO_NAME")
  }

  PORT =
    typeof LOGO_PORT === "number"
      ? (LOGO_PORT as number)
      : await getPort({
          host: LOGO_IPV6 ? "::" : "0.0.0.0"
        })

  SERVER = serve({
    development: NODE_ENV !== "production",
    port: PORT,
    routes: {
      [`/${LOGO_NAME}`]: new Response(file(`${LOGO_PATH}/${LOGO_NAME}`)),
      [`/${LOGO2_NAME}`]: new Response(file(`${LOGO2_PATH}/${LOGO2_NAME}`)),
      "/favicon.ico": new Response(null, { status: status.NO_CONTENT }),
      "/*": (): Response => new Response(status[404], { status: status.NOT_FOUND })
    }
  })

  if (NODE_ENV === "test") {
    testingPort = PORT
  }
}

const startLogoServer = async (): Promise<void> => {
  if (!SERVER) {
    await server()

    if (DEBUG) {
      info(`Logo server started on port ${PORT}`)
      info(`• Routing for: ${[LOGO_NAME, LOGO2_NAME].join(",")}`)
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

export { startLogoServer, stopLogoServer, testingPort }

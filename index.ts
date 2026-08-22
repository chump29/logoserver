import { file, type Server, serve } from "bun"

import { info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { default as getPort } from "get-port"
import { status } from "http-status"

import { env } from "./env.config.ts"

const DEBUG: boolean = env.IS_DEBUG

let SERVER: Nullable<Server<undefined>> = null

let PORT: number = 0

let testingPort: Nullable<number> = null

const ext: string[] = [".png", ".webp", ".jpg", ".jpeg"]

const server = async (): Promise<void> => {
  if (!ext.some((e: string): boolean => env.LOGO_NAME.endsWith(e))) {
    await stopLogoServer()
    throw new Error("Invalid LOGO_NAME")
  }

  PORT =
    typeof env.LOGO_PORT === "number"
      ? (env.LOGO_PORT as number)
      : await getPort({
          host: env.LOGO_IPV6 ? "::" : "0.0.0.0"
        })

  SERVER = serve({
    development: env.NODE_ENV !== "production",
    port: PORT,
    routes: {
      [`/${env.LOGO_NAME}`]: new Response(file(`${env.LOGO_PATH}/${env.LOGO_NAME}`)),
      [`/${env.LOGO2_NAME}`]: new Response(file(`${env.LOGO2_PATH}/${env.LOGO2_NAME}`)),
      "/favicon.ico": new Response(null, { status: status.NO_CONTENT }),
      "/*": (): Response => new Response(status[404], { status: status.NOT_FOUND })
    }
  })

  if (env.NODE_ENV === "test") {
    testingPort = PORT
  }
}

const startLogoServer = async (): Promise<void> => {
  if (!SERVER) {
    await server()

    if (DEBUG) {
      info(`Logo server started on port ${PORT}`)
      info(`• Routing for: ${[env.LOGO_NAME, env.LOGO2_NAME].join(",")}`)
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

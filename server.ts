import process from "node:process"

import { error, info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { type ILogoServerConfig, LogoServer, testingPort } from "./index.ts"

let SERVER: Nullable<LogoServer> = null

let isShutdown: boolean = false

const DEBUG: boolean = Boolean(Bun.env.DEBUG)

SERVER = new LogoServer({
  DEBUG,
  LOGO_NAME: Bun.env.LOGO_NAME,
  LOGO_PATH: Bun.env.LOGO_PATH
} as ILogoServerConfig)

const shutdown = async (event: string = "ERROR"): Promise<void> => {
  if (isShutdown) {
    return
  }

  if (DEBUG) {
    info(`❌ ${event} detected`)
  }

  isShutdown = true

  await SERVER?.stop()

  process.exit(0)
}

for (const event of ["SIGINT", "SIGTERM"]) {
  process.on(event, (e: string): void => {
    shutdown(e).catch((err: unknown) => {
      error("❌ Error during shutdown", err)

      process.exit(1)
    })
  })
}

await SERVER.start()

if (DEBUG) {
  console.info(`✨ Server running @ http://localhost:${testingPort}/${Bun.env.LOGO_NAME}`)
}

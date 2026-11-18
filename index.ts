import { join } from "node:path"

import { serve } from "bun"

import { info } from "@postfmly/logger"
import { type Nullable } from "@postfmly/types"

import { serveStatic } from "@hono/bun"
import { default as getPort } from "get-port"
import { type Context } from "hono"
import { secureHeaders } from "hono/secure-headers"
import { Hono } from "hono/tiny"
import { type ContentfulStatusCode } from "hono/utils/http-status"
import { status } from "http-status"

import { env } from "./env.ts"

interface ILogoServerConfig {
  /** Show debug
   * @default false */
  readonly DEBUG?: boolean
  /** Use IPv6
   * @default false */
  readonly LOGO_IPV6?: boolean
  /** Primary logo name
   * @default undefined */
  readonly LOGO_NAME?: string
  /** Primary logo path on server
   * @default . */
  readonly LOGO_PATH?: string
  /** Logo server port
   * @default random */
  readonly LOGO_PORT?: number | "random"
}

type BunServer = ReturnType<typeof serve>

let instance: Nullable<Promise<BunServer>> = null

/** For testing only */
let testingPort: Nullable<number> = null

const ext = [".png", ".webp", ".jpg", ".jpeg", ".gif"] as const

/** Logo server */
class LogoServer implements ILogoServerConfig {
  readonly DEBUG: boolean
  readonly LOGO_IPV6: boolean
  readonly LOGO_NAME?: string
  readonly LOGO_PATH: string
  readonly LOGO_PORT: "random" | number

  private get logo(): string {
    // biome-ignore lint/style/noNonNullAssertion: only called if defined
    return join(this.LOGO_PATH, this.LOGO_NAME!)
  }

  /** Logo server constructor
   * @summary config The configuration
   * @see {@link ILogoServerConfig} */
  constructor(config: ILogoServerConfig) {
    this.DEBUG = config.DEBUG ?? env.DEBUG
    this.LOGO_IPV6 = config.LOGO_IPV6 ?? env.LOGO_IPV6
    this.LOGO_NAME = config.LOGO_NAME ?? env.LOGO_NAME
    this.LOGO_PATH = config.LOGO_PATH ?? env.LOGO_PATH
    this.LOGO_PORT = config.LOGO_PORT ?? env.LOGO_PORT

    const logoName = this.LOGO_NAME // scope
    if (!(logoName && ext.some((e: string): boolean => logoName.endsWith(e)))) {
      throw new Error("Invalid LOGO_NAME")
    }
  }

  private readonly server = async (): Promise<BunServer> => {
    const getHost = (): "::" | "0.0.0.0" => (this.LOGO_IPV6 ? "::" : "0.0.0.0")

    const port =
      typeof this.LOGO_PORT === "number"
        ? this.LOGO_PORT
        : await getPort({
            host: getHost()
          })

    const hono = new Hono()

    hono.use("*", secureHeaders({ crossOriginResourcePolicy: false }))

    hono.get(`/${this.LOGO_NAME}`, serveStatic({ path: this.logo }))

    hono.get("/favicon.ico", (c: Context) => c.body(null, status.NO_CONTENT))

    const NOT_FOUND: ContentfulStatusCode = status.NOT_FOUND
    hono.notFound((c: Context) => c.text(status[NOT_FOUND], NOT_FOUND))

    const server = serve({
      fetch: hono.fetch,
      hostname: getHost(),
      port
    })

    if (Bun.env.NODE_ENV === "test") {
      testingPort = port
    }

    return server
  }

  /** Start logo server */
  start = async (): Promise<void> => {
    if (instance !== null) {
      await instance // block

      if (this.DEBUG) {
        info("⚠️  Logo server already started")
      }

      return
    }

    const startup = this.server().catch((e: unknown): never => {
      instance = null

      throw e
    })

    instance = startup

    const server = await startup

    if (this.DEBUG) {
      info(`🟢 Logo server started on port ${server.port}`)
      console.info(` ⤷ Routing for: ${this.logo}`) // no timestamp
    }
  }

  /** Stop logo server */
  stop = async (): Promise<void> => {
    const current = instance

    if (current !== null) {
      instance = null

      const server = await current.catch((): null => null) // resolve or block

      if (server !== null) {
        await server.stop()

        if (Bun.env.NODE_ENV === "test") {
          testingPort = null
        }

        if (this.DEBUG) {
          info("🔴 Logo server stopped")
        }
      }
    } else if (this.DEBUG) {
      info("⚠️  Logo server already stopped")
    }
  }
}

export { type ILogoServerConfig, LogoServer, testingPort }

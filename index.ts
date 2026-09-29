import { STATUS_CODES } from "node:http"
import { constants } from "node:http2"

import { serve } from "bun"

import { info } from "@postfmly/logger"
import { type Nullable, type Optional } from "@postfmly/types"

import { default as getPort } from "get-port"
import { type Context } from "hono"
import { serveStatic } from "hono/bun"
import { secureHeaders } from "hono/secure-headers"
import { Hono } from "hono/tiny"
import { type ClientErrorStatusCode, type SuccessStatusCode } from "hono/utils/http-status"
import {
  gtValue,
  integer,
  literal,
  ltValue,
  nonEmpty,
  number,
  optional,
  parse,
  pipe,
  string,
  toBoolean,
  trim,
  union,
  unknown
} from "valibot"

interface ILogoServerConfig {
  readonly DEBUG: Optional<boolean>
  readonly LOGO_IPV6: Optional<boolean>
  readonly LOGO_NAME: string
  readonly LOGO_PATH: Optional<string>
  readonly LOGO_PORT: Optional<number | "random">
  readonly LOGO2_NAME: Optional<string>
  readonly LOGO2_PATH: Optional<string>
}

const BooleanSchema = pipe(unknown(), toBoolean())
const StringSchema = pipe(string(), trim(), nonEmpty())

const MIN_PORT: number = 1024
const MAX_PORT: number = 65_535

let SERVER: Nullable<ReturnType<typeof serve>> = null

let PORT: number = 0

/** For testing only */
let testingPort: Nullable<number> = null

const ext: string[] = [".png", ".webp", ".jpg", ".jpeg", ".gif"] as const

const {
  HTTP_STATUS_NOT_FOUND: NOT_FOUND,
  HTTP_STATUS_NO_CONTENT: NO_CONTENT
}: { HTTP_STATUS_NOT_FOUND: number; HTTP_STATUS_NO_CONTENT: number } = constants

const STR_NOT_FOUND: string = STATUS_CODES[NOT_FOUND] as string

class LogoServer implements ILogoServerConfig {
  readonly DEBUG: Optional<boolean>
  readonly LOGO_IPV6: Optional<boolean>
  readonly LOGO_NAME: string
  readonly LOGO_PATH: Optional<string>
  readonly LOGO_PORT: Optional<"random" | number>
  readonly LOGO2_NAME: Optional<string>
  readonly LOGO2_PATH: Optional<string>

  private get logo(): string {
    return `${this.LOGO_PATH}/${this.LOGO_NAME}`
  }
  private get logo2(): string {
    return `${this.LOGO2_PATH}/${this.LOGO2_NAME}`
  }

  constructor(config: ILogoServerConfig) {
    this.DEBUG = parse(optional(BooleanSchema, false), config.DEBUG)
    this.LOGO_IPV6 = parse(optional(BooleanSchema, false), config.LOGO_IPV6)
    this.LOGO_NAME = parse(pipe(string("Invalid LOGO_NAME"), trim(), nonEmpty()), config.LOGO_NAME)
    this.LOGO_PATH = parse(optional(StringSchema, "."), config.LOGO_PATH)
    this.LOGO_PORT = parse(
      optional(
        union([pipe(StringSchema, literal("random")), pipe(number(), integer(), gtValue(MIN_PORT), ltValue(MAX_PORT))]),
        "random"
      ),
      config.LOGO_PORT
    )
    this.LOGO2_NAME = parse(optional(StringSchema), config.LOGO2_NAME)
    this.LOGO2_PATH = parse(optional(StringSchema, "."), config.LOGO2_PATH)
  }

  private readonly server = async (): Promise<void> => {
    if (!ext.some((e: string): boolean => this.LOGO_NAME.endsWith(e))) {
      await this.stop()
      throw new Error("Invalid LOGO_NAME")
    }

    const getHost = (): string => (this.LOGO_IPV6 ? "::" : "0.0.0.0")

    PORT =
      typeof this.LOGO_PORT === "number"
        ? (this.LOGO_PORT as number)
        : await getPort({
            host: getHost()
          })

    const hono: Hono = new Hono()

    hono.use(
      "*",
      secureHeaders({
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: false,
        crossOriginResourcePolicy: false
      })
    )

    hono.get(`/${this.LOGO_NAME}`, serveStatic({ path: this.logo }))

    if (this.LOGO2_NAME) {
      hono.get(`/${this.LOGO2_NAME}`, serveStatic({ path: this.logo2 }))
    }

    hono.get("/favicon.ico", (c: Context) => c.body(null, NO_CONTENT as SuccessStatusCode))

    hono.notFound((c: Context) => c.text(STR_NOT_FOUND, NOT_FOUND as ClientErrorStatusCode))

    SERVER = serve({
      fetch: hono.fetch,
      hostname: getHost(),
      port: PORT
    })

    if (Bun.env.NODE_ENV === "test") {
      testingPort = PORT
    }
  }

  start = async (): Promise<void> => {
    if (!SERVER) {
      await this.server()

      if (this.DEBUG) {
        info(`🟢 Logo server started on port ${PORT}`)
        console.info(` ⤷ Routing for: ${[this.LOGO_NAME, this.LOGO2_NAME].filter(Boolean).join(",")}`)
      }
    } else if (this.DEBUG) {
      info("⚠️  Logo server already started")
    }
  }

  stop = async (): Promise<void> => {
    if (SERVER) {
      await SERVER.stop()

      SERVER = null

      if (this.DEBUG) {
        info("🔴 Logo server stopped")
      }
    } else if (this.DEBUG) {
      info("⚠️  Logo server already stopped")
    }
  }
}

export { type ILogoServerConfig, LogoServer, testingPort }

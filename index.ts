import { file, type Server, serve } from "bun"

import { info } from "@postfmly/logger"
import { type Nullable, type Optional } from "@postfmly/types"

import { default as getPort } from "get-port"
import { default as nosecone } from "nosecone"
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

let SERVER: Nullable<Server<undefined>> = null

let PORT: number = 0

/**
 * For testing only
 */
let testingPort: Nullable<number> = null

const ext: string[] = [".png", ".webp", ".jpg", ".jpeg", ".gif"] as const

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

    const getResponse = (body: Nullable<BodyInit>, opt?: ResponseInit): Response =>
      new Response(body, { ...opt, headers: nosecone() })

    const status = {
      404: "Not Found",
      NO_CONTENT: 204,
      NOT_FOUND: 404
    } as const

    const routes: Record<string, () => Response> = {}
    routes[`/${this.LOGO_NAME}`] = (): Response => getResponse(file(this.logo))
    if (this.LOGO2_NAME) {
      routes[`/${this.LOGO2_NAME}`] = (): Response => getResponse(file(this.logo2))
    }
    routes["/favicon.ico"] = (): Response => getResponse(null, { status: status.NO_CONTENT })
    routes["/*"] = (): Response => getResponse(status[404], { status: status.NOT_FOUND })

    SERVER = serve({
      hostname: getHost(),
      port: PORT,
      routes
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

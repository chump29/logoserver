import { file, type Server, serve } from "bun"

import { info } from "@postfmly/logger"
import { type Nullable, type Optional } from "@postfmly/types"

import { parseBoolean } from "@marianmeres/parse-boolean"
import { default as getPort } from "get-port"
import { status } from "http-status"
import { nanoid } from "nanoid"
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
  transform,
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

const BooleanSchema = pipe(
  unknown(),
  transform((u: unknown): boolean => parseBoolean(u))
)
const StringSchema = pipe(string(), trim(), nonEmpty())

const MIN_PORT: number = 1024
const MAX_PORT: number = 65_535

let SERVER: Nullable<Server<undefined>> = null

let PORT: number = 0

let testingPort: Nullable<number> = null

const ext: string[] = [".png", ".webp", ".jpg", ".jpeg"]

class LogoServer implements ILogoServerConfig {
  readonly DEBUG: Optional<boolean>
  readonly LOGO_IPV6: Optional<boolean>
  readonly LOGO_NAME: string
  readonly LOGO_PATH: Optional<string>
  readonly LOGO_PORT: Optional<number | "random">
  readonly LOGO2_NAME: Optional<string>
  readonly LOGO2_PATH: Optional<string>

  private get logo(): string {
    return `${this.LOGO_PATH}/${this.LOGO_NAME}`
  }
  private get logo2(): string {
    return `${this.LOGO2_PATH}/${this.LOGO2_NAME}`
  }

  constructor(config: ILogoServerConfig = {} as ILogoServerConfig) {
    this.DEBUG = parse(optional(BooleanSchema, false), Bun.env.DEBUG ?? config.DEBUG)
    this.LOGO_IPV6 = parse(optional(BooleanSchema, false), Bun.env.LOGO_IPV6 ?? config.LOGO_IPV6)
    this.LOGO_NAME = parse(pipe(string("Invalid LOGO_NAME"), trim(), nonEmpty()), Bun.env.LOGO_NAME ?? config.LOGO_NAME)
    this.LOGO_PATH = parse(optional(StringSchema, "."), Bun.env.LOGO_PATH ?? config.LOGO_PATH)
    this.LOGO_PORT = parse(
      optional(union([pipe(number(), integer(), gtValue(MIN_PORT), ltValue(MAX_PORT)), literal("random")]), "random"),
      Bun.env.LOGO_PORT ?? config.LOGO_PORT
    )
    this.LOGO2_NAME = parse(optional(StringSchema, nanoid()), Bun.env.LOGO2_NAME ?? config.LOGO2_NAME)
    this.LOGO2_PATH = parse(optional(StringSchema, "."), Bun.env.LOGO2_PATH ?? config.LOGO2_PATH)
  }

  private readonly server = async (): Promise<void> => {
    if (!ext.some((e: string): boolean => this.LOGO_NAME.endsWith(e))) {
      await this.stop()
      throw new Error("Invalid LOGO_NAME")
    }

    PORT =
      typeof this.LOGO_PORT === "number"
        ? (this.LOGO_PORT as number)
        : await getPort({
            host: this.LOGO_IPV6 ? "::" : "0.0.0.0"
          })

    SERVER = serve({
      development: Bun.env.NODE_ENV !== "production",
      port: PORT,
      routes: {
        [`/${this.LOGO_NAME}`]: new Response(file(this.logo)),
        [`/${this.LOGO2_NAME}`]: this.LOGO2_NAME
          ? new Response(file(this.logo2))
          : new Response(status[418], { status: status.IM_A_TEAPOT }),
        "/favicon.ico": new Response(null, { status: status.NO_CONTENT }),
        "/*": (): Response => new Response(status[404], { status: status.NOT_FOUND })
      }
    })

    if (Bun.env.NODE_ENV === "test") {
      testingPort = PORT
    }
  }

  start = async (): Promise<void> => {
    if (!SERVER) {
      await this.server()

      if (this.DEBUG) {
        info(`Logo server started on port ${PORT}`)
        info(`• Routing for: ${[this.LOGO2_PATH + this.LOGO_NAME, this.LOGO2_NAME].join(",")}`)
      }
    } else if (this.DEBUG) {
      info("Logo server already started")
    }
  }

  stop = async (): Promise<void> => {
    if (SERVER) {
      await SERVER.stop()

      SERVER = null

      if (this.DEBUG) {
        info("Logo server stopped")
      }
    } else if (this.DEBUG) {
      info("Logo server already stopped")
    }
  }
}

export { type ILogoServerConfig, LogoServer, testingPort }

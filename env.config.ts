import { default as process } from "node:process"

import { parseBoolean } from "@marianmeres/parse-boolean"
import { defineEnv } from "envin"
import { nanoid } from "nanoid"
import {
  fallback,
  literal,
  maxValue,
  minValue,
  nonEmpty,
  pipe,
  string,
  toLowerCase,
  toNumber,
  transform,
  trim,
  union
} from "valibot"

const StringSchema = pipe(string(), trim(), nonEmpty())

const BooleanSchema = pipe(
  StringSchema,
  transform((s: string): boolean => parseBoolean(s))
)

const MIN_PORT: number = 1024
const MAX_PORT: number = 65_535

const PortSchema = fallback(
  union([
    pipe(StringSchema, toLowerCase(), literal("random")),
    pipe(StringSchema, toNumber(), minValue(MIN_PORT), maxValue(MAX_PORT))
  ]),
  "random"
)

// biome-ignore lint/suspicious/noExplicitAny: to happily generate d.ts
const env: any = defineEnv({
  env: process.env,
  server: {
    DEBUG: fallback(BooleanSchema, false),
    LOGO_IPV6: fallback(BooleanSchema, false),
    LOGO_NAME: StringSchema,
    LOGO_PATH: fallback(StringSchema, "."),
    LOGO_PORT: fallback(PortSchema, "random"),
    LOGO2_NAME: fallback(StringSchema, nanoid()), // not empty
    LOGO2_PATH: fallback(StringSchema, ".")
  },
  shared: {
    NODE_ENV: fallback(StringSchema, "development")
  }
})

export default env

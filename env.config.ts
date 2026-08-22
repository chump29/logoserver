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
  optional,
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
export const env: any = defineEnv({
  env: process.env,
  server: {
    IS_DEBUG: BooleanSchema,
    LOGO_IPV6: BooleanSchema,
    LOGO_NAME: fallback(StringSchema, nanoid()), // not empty
    LOGO_PATH: fallback(StringSchema, ""),
    LOGO_PORT: PortSchema,
    LOGO2_NAME: fallback(StringSchema, nanoid()), // not empty
    LOGO2_PATH: fallback(StringSchema, ""),
    NODE_ENV: optional(StringSchema)
  }
})

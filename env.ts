import { printVars } from "@postfmly/logger"

import { bool, cleanEnv, makeExactValidator, str } from "envalid"
import { integer, literal, maxValue, minValue, nonEmpty, parse, pipe, string, toNumber, trim, union } from "valibot"

const MIN_PORT = 1024
const MAX_PORT = 65_535

const StringSchema = pipe(string(), trim(), nonEmpty())
const PortSchema = union([
  literal("random"),
  pipe(StringSchema, toNumber(), integer(), minValue(MIN_PORT), maxValue(MAX_PORT))
])

const portValidator = makeExactValidator<"random" | number>((s: string): "random" | number => parse(PortSchema, s))

const env = cleanEnv(Bun.env, {
  DEBUG: bool({ default: false, testDefault: true }),
  LOGO_IPV6: bool({ default: false }),
  LOGO_NAME: str({ default: undefined, testDefault: "test.webp" }),
  LOGO_PATH: str({ default: ".", testDefault: "tests" }),
  LOGO_PORT: portValidator({ default: "random" }),
  TEST_FULL: bool({ default: false })
})

if (import.meta.main) {
  printVars(env)
}

export { env }

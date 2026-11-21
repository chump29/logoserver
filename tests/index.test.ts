import { afterEach, describe, expect, spyOn, test } from "bun:test"

import { type ContentfulStatusCode } from "hono/utils/http-status"

import { env } from "../env.ts"
import { type ILogoServerConfig, LogoServer, testingPort } from "../index.ts"

const HttpStatus = {
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  OK: 200
} as const

const HttpMessage = {
  [HttpStatus.NOT_FOUND]: "Not Found"
} as const

const logoServer: LogoServer = new LogoServer({
  DEBUG: env.DEBUG,
  LOGO_NAME: env.LOGO_NAME,
  LOGO_PATH: env.LOGO_PATH
} satisfies ILogoServerConfig)

if (!env.TEST_FULL) {
  spyOn(console, "info").mockImplementation((): void => undefined)
}

afterEach(async (): Promise<void> => {
  await logoServer.stop() // in case of fail
})

describe("index", (): void => {
  test("logo", async (): Promise<void> => {
    await logoServer.start()
    await logoServer.start() // for coverage

    const response = await fetch(new Request(`http://localhost:${testingPort}/${env.LOGO_NAME}`))

    expect(response.status).toBe(HttpStatus.OK)
    expect(response.headers.get("content-type")).toStartWith("image/")

    await logoServer.stop()
    await logoServer.stop() // for coverage
  })

  test("favicon", async (): Promise<void> => {
    await logoServer.start()

    const response = await fetch(new Request(`http://localhost:${testingPort}/favicon.ico`))

    expect(response.status).toBe(HttpStatus.NO_CONTENT)
    expect(await response.text()).toBeEmpty()

    await logoServer.stop()
  })

  test("not found", async (): Promise<void> => {
    await logoServer.start()

    const response = await fetch(new Request(`http://localhost:${testingPort}/test`))
    const NOT_FOUND: ContentfulStatusCode = HttpStatus.NOT_FOUND

    expect(response.status).toBe(NOT_FOUND)
    expect(await response.text()).toBe(HttpMessage[NOT_FOUND])

    await logoServer.stop()
  })

  test("invalid logo", (): void => {
    expect((): LogoServer => new LogoServer({ LOGO_NAME: "logo.test" } satisfies ILogoServerConfig)).toThrow(
      "Invalid LOGO_NAME"
    )
  })
})

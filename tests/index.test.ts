import { describe, expect, spyOn, test } from "bun:test"

import { type ContentfulStatusCode } from "hono/utils/http-status"
import { status } from "http-status"

import { env } from "../env.ts"
import { type ILogoServerConfig, LogoServer, testingPort } from "../index.ts"

const logoServer: LogoServer = new LogoServer({
  DEBUG: env.DEBUG,
  LOGO_NAME: env.LOGO_NAME,
  LOGO_PATH: env.LOGO_PATH,
  LOGO2_NAME: env.LOGO2_NAME,
  LOGO2_PATH: env.LOGO2_PATH
} satisfies ILogoServerConfig)

// * NOTE: suppress console output
spyOn(console, "info").mockImplementation((): void => undefined)

describe("index", (): void => {
  test("logo", async (): Promise<void> => {
    await logoServer.start()
    await logoServer.start() // for coverage

    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/${env.LOGO_NAME}`))

    expect(response.status).toBe(status.OK)
    expect(response.headers.get("content-type")).toStartWith("image/")

    await logoServer.stop()
    await logoServer.stop() // for coverage
  })

  test("logo2", async (): Promise<void> => {
    await logoServer.start()

    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/${env.LOGO2_NAME}`))

    expect(response.status).toBe(status.OK)
    expect(response.headers.get("content-type")).toStartWith("image/")

    await logoServer.stop()
  })

  test("favicon", async (): Promise<void> => {
    await logoServer.start()

    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/favicon.ico`))

    expect(response.status).toBe(status.NO_CONTENT)
    expect(await response.text()).toBeEmpty()

    await logoServer.stop()
  })

  test("not found", async (): Promise<void> => {
    await logoServer.start()

    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/test`))
    const NOT_FOUND: ContentfulStatusCode = status.NOT_FOUND

    expect(response.status).toBe(NOT_FOUND)
    expect(await response.text()).toBe(status[NOT_FOUND])

    await logoServer.stop()
  })
})

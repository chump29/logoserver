import { STATUS_CODES } from "node:http"
import { constants } from "node:http2"

import { beforeAll, describe, expect, type jest, spyOn, test } from "bun:test"

import { type ILogoServerConfig, LogoServer, testingPort } from "../index.ts"

const logoServer: LogoServer = new LogoServer({
  DEBUG: Bun.env.DEBUG,
  LOGO_NAME: Bun.env.LOGO_NAME,
  LOGO_PATH: Bun.env.LOGO_PATH,
  LOGO2_NAME: Bun.env.LOGO2_NAME,
  LOGO2_PATH: Bun.env.LOGO2_PATH
} as ILogoServerConfig)

const infoSpy: jest.Mock = spyOn(console, "info")

const {
  HTTP_STATUS_NOT_FOUND: NOT_FOUND,
  HTTP_STATUS_NO_CONTENT: NO_CONTENT,
  HTTP_STATUS_OK: OK
}: { HTTP_STATUS_NOT_FOUND: number; HTTP_STATUS_NO_CONTENT: number; HTTP_STATUS_OK: number } = constants

const STR_NOT_FOUND: string = STATUS_CODES[NOT_FOUND] as string

beforeAll((): void => {
  infoSpy.mockReset() // suppress
})

describe("index", (): void => {
  test("logo", async (): Promise<void> => {
    await logoServer.start()
    await logoServer.start() // for coverage
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/${Bun.env.LOGO_NAME}`))
    expect(response.status).toBe(OK)
    expect(response.headers.get("content-type")).toStartWith("image/")
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff")
    await logoServer.stop()
    await logoServer.stop() // for coverage
  })

  test("logo2", async (): Promise<void> => {
    await logoServer.start()
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/${Bun.env.LOGO2_NAME}`))
    expect(response.status).toBe(OK)
    expect(response.headers.get("content-type")).toStartWith("image/")
    await logoServer.stop()
  })

  test("favicon", async (): Promise<void> => {
    await logoServer.start()
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/favicon.ico`))
    expect(response.status).toBe(NO_CONTENT)
    expect(await response.text()).toBeEmpty()
    await logoServer.stop()
  })

  test("not found", async (): Promise<void> => {
    await logoServer.start()
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/test`))
    expect(response.status).toBe(NOT_FOUND)
    expect(await response.text()).toBe(STR_NOT_FOUND)
    await logoServer.stop()
  })
})

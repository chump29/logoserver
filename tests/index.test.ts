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

const status = {
  404: "Not Found",
  NO_CONTENT: 204,
  NOT_FOUND: 404,
  OK: 200
} as const

beforeAll((): void => {
  infoSpy.mockReset() // suppress
})

describe("index", (): void => {
  test("logo", async (): Promise<void> => {
    await logoServer.start()
    await logoServer.start() // for coverage
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/${Bun.env.LOGO_NAME}`))
    expect(response.status).toBe(status.OK)
    expect(response.headers.get("content-type")).toStartWith("image/")
    expect(response.headers.get("content-security-policy")?.length ?? 0).toBeGreaterThan(0) // for nosecone
    await logoServer.stop()
    await logoServer.stop() // for coverage
  })

  test("logo2", async (): Promise<void> => {
    await logoServer.start()
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/${Bun.env.LOGO2_NAME}`))
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
    expect(response.status).toBe(status.NOT_FOUND)
    expect(await response.text()).toBe(status[404])
    await logoServer.stop()
  })
})

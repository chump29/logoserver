import { describe, expect, test } from "bun:test"

import { status } from "http-status"

import { forTesting, startLogoServer, stopLogoServer } from "./index.ts"

describe("index", (): void => {
  test("logo", async (): Promise<void> => {
    await startLogoServer()
    await startLogoServer() // * NOTE: for code coverage
    const response: Response = await fetch(new Request(`http://localhost:${forTesting!.PORT}${forTesting!.NAME}`))
    expect(response.status).toBe(status.OK)
    expect(response.headers.get("content-type")).toStartWith("image/")
    await stopLogoServer()
    await stopLogoServer() // * NOTE: for code coverage
  })

  test("logo - fail", async (): Promise<void> => {
    const bak: string = Bun.env.LOGO_NAME
    Bun.env.LOGO_NAME = ""
    expect(async (): Promise<void> => await startLogoServer()).toThrowError("Invalid LOGO_NAME")
    Bun.env.LOGO_NAME = bak
  })

  test("favicon", async (): Promise<void> => {
    await startLogoServer()
    const response: Response = await fetch(new Request(`http://localhost:${forTesting!.PORT}/favicon.ico`))
    expect(response.status).toBe(status.NO_CONTENT)
    expect(await response.text()).toBeEmpty()
    await stopLogoServer()
  })

  test("not found", async (): Promise<void> => {
    await startLogoServer()
    const response: Response = await fetch(new Request(`http://localhost:${forTesting!.PORT}/test`))
    expect(response.status).toBe(status.NOT_FOUND)
    expect(await response.text()).toBe(status[404])
    await stopLogoServer()
  })

  test("IPv6", async (): Promise<void> => {
    const bak: string = Bun.env.LOGO_IPv6
    Bun.env.LOGO_IPv6 = "true"
    expect(async (): Promise<void> => await startLogoServer()).toThrowError("Failed to listen at ::")
    Bun.env.LOGO_IPv6 = bak
  })
})

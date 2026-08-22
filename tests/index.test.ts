import { beforeAll, describe, expect, type jest, spyOn, test } from "bun:test"

import { status } from "http-status"
import { default as ms } from "ms"

import { env } from "../env.config.ts"
import { startLogoServer, stopLogoServer, testingPort } from "../index.ts"

const infoSpy: jest.Mock = spyOn(console, "info")

beforeAll((): void => {
  infoSpy.mockReset() // suppress
})

describe("index", (): void => {
  const getImage = async (fileName: string): Promise<void> => {
    if (!fileName.endsWith(".webp")) {
      return
    }

    await fetch("https://picsum.photos/64.webp", {
      signal: AbortSignal.timeout(ms("2s"))
    }).then(async (response: Response): Promise<number> => await Bun.write(fileName, await response.blob()))
  }

  test("logo", async (): Promise<void> => {
    await getImage(`${env.LOGO_PATH}/${env.LOGO_NAME}`)
    await getImage(`${env.LOGO2_PATH}/${env.LOGO2_NAME}`)

    await startLogoServer()
    await startLogoServer() // for coverage
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/${env.LOGO_NAME}`))
    expect(response.status).toBe(status.OK)
    expect(response.headers.get("content-type")).toStartWith("image/")
    await stopLogoServer()
    await stopLogoServer() // for coverage
  })

  test("logo2", async (): Promise<void> => {
    await startLogoServer()
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/${env.LOGO2_NAME}`))
    expect(response.status).toBe(status.OK)
    expect(response.headers.get("content-type")).toStartWith("image/")
    await stopLogoServer()
  })

  test("favicon", async (): Promise<void> => {
    await startLogoServer()
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/favicon.ico`))
    expect(response.status).toBe(status.NO_CONTENT)
    expect(await response.text()).toBeEmpty()
    await stopLogoServer()
  })

  test("not found", async (): Promise<void> => {
    await startLogoServer()
    const response: Response = await fetch(new Request(`http://localhost:${testingPort}/test`))
    expect(response.status).toBe(status.NOT_FOUND)
    expect(await response.text()).toBe(status[404])
    await stopLogoServer()
  })
})

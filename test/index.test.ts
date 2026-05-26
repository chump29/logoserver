import { describe, expect, test } from "bun:test"

import { error } from "@postfmly/logger"

import { status } from "http-status"
import { default as ms } from "ms"
import { integer, nonEmpty, number, parse, pipe, string } from "valibot"

import { startLogoServer, stopLogoServer, testingPort } from "../index.ts"

describe("index", async (): Promise<void> => {
  const getImage = async (fileName: string): Promise<void> => {
    await fetch("https://picsum.photos/64.webp", {
      signal: AbortSignal.timeout(ms("1s"))
    }).then(async (response: Response): Promise<number> => await Bun.write(fileName, await response.blob()))
  }

  let PORT: number = 0
  let LOGO_NAME: string = ""
  let LOGO2_NAME: string = ""

  test("logo", async (): Promise<void> => {
    await startLogoServer()

    try {
      PORT = parse(pipe(number(), integer()), testingPort)
      LOGO_NAME = parse(pipe(string(), nonEmpty()), Bun.env.LOGO_NAME)
      LOGO2_NAME = parse(pipe(string(), nonEmpty()), Bun.env.LOGO2_NAME)

      Bun.env.LOGO_PATH = __dirname
      Bun.env.LOGO2_PATH = __dirname

      await getImage(`${Bun.env.LOGO_PATH}/${LOGO_NAME}`)
      await getImage(`${Bun.env.LOGO2_PATH}/${LOGO2_NAME}`)
    } catch (e: unknown) {
      error(e)
      return
    }

    await startLogoServer() // * NOTE: for code coverage
    const response: Response = await fetch(new Request(`http://localhost:${PORT}/${LOGO_NAME}`))
    expect(response.status).toBe(status.OK)
    expect(response.headers.get("content-type")).toStartWith("image/")
    await stopLogoServer()
    await stopLogoServer() // * NOTE: for code coverage
  })

  test("logo2", async (): Promise<void> => {
    await startLogoServer()
    const response: Response = await fetch(new Request(`http://localhost:${PORT}/${LOGO2_NAME}`))
    expect(response.status).toBe(status.OK)
    expect(response.headers.get("content-type")).toStartWith("image/")
    await stopLogoServer()
  })

  test("logo - fail", async (): Promise<void> => {
    const bak: string | undefined = Bun.env.LOGO_NAME
    Bun.env.LOGO_NAME = ""
    expect(startLogoServer()).rejects.toThrowError("Invalid LOGO_NAME")
    Bun.env.LOGO_NAME = bak
  })

  test("favicon", async (): Promise<void> => {
    await startLogoServer()
    const response: Response = await fetch(new Request(`http://localhost:${PORT}/favicon.ico`))
    expect(response.status).toBe(status.NO_CONTENT)
    expect(await response.text()).toBeEmpty()
    await stopLogoServer()
  })

  test("not found", async (): Promise<void> => {
    await startLogoServer()
    const response: Response = await fetch(new Request(`http://localhost:${PORT}/test`))
    expect(response.status).toBe(status.NOT_FOUND)
    expect(await response.text()).toBe(status[404])
    await stopLogoServer()
  })
})

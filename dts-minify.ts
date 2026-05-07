import { createMinifier } from "dts-minify-lite"

const START: number = 2
const END: number = 3

const filename: string | undefined = Bun.argv.slice(START, END).at(0)

if (!filename) {
  throw new Error("Invalid filename")
}

await Bun.write(filename, createMinifier().minify(await Bun.file(filename).text()))

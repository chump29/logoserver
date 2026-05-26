import { exit } from "node:process"

import { type BuildMetafile, type BuildOutput, build } from "bun"

import { error, info } from "@postfmly/logger"

import { devDependencies, peerDependencies } from "./package.json" with { type: "json" }

const externalDependencies: string[] = [
  ...Object.keys(devDependencies),
  ...Object.keys(peerDependencies)
]

await build({
  external: externalDependencies,
  footer: "// ♡ ᓚᘏᗢ ♡",
  metafile: true,
  minify: true,
  outdir: "./dist",
  target: "bun",
  entrypoints: [
    "./index.ts"
  ]
})
  .then((result: BuildOutput): BuildMetafile | undefined => {
    if (!result.success) {
      error("Build failed", result.logs)
      exit(1)
    }
    return result.metafile
  })
  .then(async (metafile: BuildMetafile | undefined): Promise<void> => {
    if (metafile?.outputs) {
      for (const [path, bytes] of Object.entries(metafile.outputs)) {
        info(`${path}: ${bytes.bytes} bytes`)
        for (const [s, bytesInOutput] of Object.entries(bytes.inputs)) {
          info(`  - ${s}: ${bytesInOutput.bytesInOutput} bytes`)
        }
      }
    }
  })
  .catch((e: unknown): void => {
    error(e)
    exit(1)
  })

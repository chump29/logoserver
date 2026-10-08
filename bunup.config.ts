import { defineConfig } from "bunup"
import { copy } from "bunup/plugins"

const additionalFiles: string[] = ["LICENSE", "package.json", "README.md"]

const config: ReturnType<typeof defineConfig> = defineConfig({
  footer: "// ♡ ᓚᘏᗢ ♡",
  minify: true,
  plugins: [copy(additionalFiles)],
  target: "bun",
  onSuccess: (): void => console.info(` 🗐  Copying ${additionalFiles.join(", ")}...`),
  unused: {
    level: "error"
  }
})

export default config

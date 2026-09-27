import { defineConfig } from "bunup"
import { copy } from "bunup/plugins"

const config: ReturnType<typeof defineConfig> = defineConfig({
  footer: "// ♡ ᓚᘏᗢ ♡",
  minify: true,
  plugins: [copy(["LICENSE", "package.json", "README.md"])],
  target: "bun",
  unused: {
    level: "error"
  }
})

export default config

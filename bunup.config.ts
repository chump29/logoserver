import { defineConfig } from "bunup"
import { copy } from "bunup/plugins"

const additionalFiles = ["LICENSE", "package.json", "README.md"]

export default defineConfig({
  footer: "// ♡ ᓚᘏᗢ ♡",
  minify: true,
  plugins: [copy(additionalFiles)],
  target: "bun",
  onSuccess: (): void => console.info(` 🗐  Copying ${additionalFiles.join(", ")}...`),
  unused: {
    level: "error"
  }
})

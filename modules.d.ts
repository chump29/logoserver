import { type Optional } from "@postfmly/types"

declare module "bun" {
  interface Env {
    DEBUG: Optional<string>
    LOGO_NAME: Optional<string>
    LOGO_PATH: Optional<string>
    LOGO2_NAME: Optional<string>
    LOGO2_PATH: Optional<string>
  }
}

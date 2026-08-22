// * NOTE: for tests

declare module "bun" {
  interface Env {
    LOGO_NAME: string | undefined
    LOGO_PATH: string | undefined
    LOGO2_PATH: string | undefined
  }
}

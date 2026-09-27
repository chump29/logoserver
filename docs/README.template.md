# @postfmly/logoserver

### Logo server <!-- markdownlint-disable MD001 -->

---

![Bun](https://img.shields.io/badge/Bun-$_bun-informational?style=plastic&logo=bun "Bun") &nbsp;
![Hono](https://img.shields.io/badge/Hono-$_hono-informational?style=plastic&logo=hono "Hono")

![CodeQL](https://github.com/$_user/$_repo/workflows/CodeQL/badge.svg "CodeQL") &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-$_coverage%25-success?style=plastic&logo=jest "Coverage")

![NO AI](https://img.shields.io/badge/NO-AI-orange?style=plastic "NO AI") &nbsp;
![License](https://img.shields.io/github/license/$_user/$_repo?style=plastic&color=blueviolet&label=License&logo=gplv3 "GPLv3") &nbsp; <!-- markdownlint-disable MD013 -->
![CVE Scan](https://img.shields.io/badge/CVE%20Scan-Pass-success?style=plastic&logo=owasp "CVE Scan")

---

### Installation

```bash
bun add @postfmly/logoserver
```

---

### Use

```ts
import { type ILogoServerConfig, LogoServer } from "@postfmly/logoserver"

const logoServer: LogoServer = new LogoServer({ LOGO_NAME: "foo.png" } as ILogoServerConfig)

await logoServer.start()
await logoServer.stop()
```

### Environment Variables

|       Description       |    Key     |       Value       |
|:-----------------------:|:----------:|:-----------------:|
|          Debug          |   DEBUG    |  true/**false**   |
|        IPv4/IPv6        | LOGO_IPV6  |  true/**false**   |
|  Logo Name<sup>1<sup>   | LOGO_NAME  |    \<filename>    |
|     Logo Local Path     | LOGO_PATH  |        "."        |
|          Port           | LOGO_PORT  | **random**/[port] |
| Logo 2 Name<sup>1</sup> | LOGO2_NAME |    [filename]     |
|    Logo 2 Local Path    | LOGO2_PATH |        "."        |

###### <sup>1</sup> Supports PNG, WEBP, JPG/JPEG, GIF

---

### Linting

```bash
bun run lint
```

---

### Testing

```bash
# Tests only
bun run test

# Test only (verbose)
bun run test:full

# Tests w/Coverage
bun run test:coverage

# Tests w/Coverage (verbose)
bun run test:coverage:full

# Run server
bun run server # (CTRL-C to stop)
```

---

### Building

#### README:

```bash
./docs.sh
```

#### Package:

```bash
./build.sh
```

###### *NOTE: Includes linting, testing, and building README*

---

### Publishing

#### Publish:

```bash
./publish.sh
```

###### *NOTES:*

- ###### *Includes building package*

- ###### *Increments `patch` version in `package.json`*

#### Unpublish:

```bash
# current version
npm unpublish --force

# specific version
npm unpublish @postfmly/logoserver@[version] --force
```

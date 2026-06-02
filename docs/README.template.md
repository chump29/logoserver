# @postfmly/logoserver

### Logo server <!-- markdownlint-disable MD001 -->

---

![Bun](https://img.shields.io/badge/Bun-$_bun-informational?style=plastic&logo=bun "Bun")

![CodeQL](https://github.com/chump29/logoserver/workflows/CodeQL/badge.svg "CodeQL") &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-$_coverage%25-success?style=plastic&logo=jest "Coverage")

![License](https://img.shields.io/github/license/chump29/logoserver?style=plastic&color=blueviolet&label=License&logo=gplv3 "GPLv3")

---

### Installation

```bash
bun add @postfmly/logoserver
```

---

### Use

```ts
import { startLogoServer, stopLogoServer } from "@postfmly/logoserver"

await startLogoServer()
await stopLogoServer()
```

### Environment Variables

|    Description    |    Key     |       Value       |
|:-----------------:|:----------:|:-----------------:|
|       Debug       |  IS_DEBUG  |  true/**false**   |
|     IPv4/IPv6     | LOGO_IPV6  |  true/**false**   |
|     Logo Name     | LOGO_NAME  |    [filename]     |
|  Logo Local Path  | LOGO_PATH  |      [path]       |
|       Port        | LOGO_PORT  | **Random**/[port] |
|    Logo 2 Name    | LOGO2_NAME |    [filename]     |
| Logo 2 Local Path | LOGO2_PATH |      [path]       |

---

### Linting

```bash
bun run lint
```

---

### Testing

```bash
bun run test
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

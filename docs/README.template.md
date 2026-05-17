# @postfmly/logoserver

> - Logo server

---

![Biome](https://img.shields.io/badge/Biome-$_biome-informational?style=plastic&logo=biome) &nbsp;
![Bun](https://img.shields.io/badge/Bun-$_bun-informational?style=plastic&logo=bun)

![CodeQL](https://github.com/chump29/logoserver/workflows/CodeQL/badge.svg) &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-$_coverage%25-success?style=plastic&logo=jest)

![License](https://img.shields.io/github/license/chump29/logoserver?style=plastic&color=blueviolet&label=License&logo=gplv3)

---

### Installation <!-- markdownlint-disable MD001 -->

```bash
bun add @postfmly/logoserver
```

### Use

```ts
import { logoServer } from "@postfmly/logoserver"

await logoServer.start()
await logoServer.stop()
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

- *NOTE: Includes linting, testing, and building README*

```bash
./build.sh
```

---

### Publishing

#### Publish:

```bash
./publish.sh
```

- *NOTES:*

  - *Includes building package*

  - *Increments `patch` version in `package.json`*

#### Unpublish:

```bash
# current version
npm unpublish --force

# specific version
npm unpublish @postfmly/logoserver@[version] --force
```

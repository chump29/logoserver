# @postfmly/logoserver

> - Logo server

---

![Biome](https://img.shields.io/badge/Biome-^2.4.13-informational?style=plastic&logo=biome) &nbsp;
![Bun](https://img.shields.io/badge/Bun-~1.3.13-informational?style=plastic&logo=bun)

![CodeQL](https://github.com/chump29/logoserver/workflows/CodeQL/badge.svg) &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-100%25-success?style=plastic&logo=jest)

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

|     Description     |    Key     |       Value       |
|:-------------------:|:----------:|:-----------------:|
|        Debug        |  IS_DEBUG  |  true/**false**   |
|      IPv4/IPv6      | LOGO_IPv6  |  true/**false**   |
|      Logo Name      | LOGO_NAME  |    [filename]     |
|     Local Path      | LOGO_PATH  |      [path]       |
|        Port         | LOGO_PORT  | **Random**/[port] |

---

### Testing

```bash
./test.sh
```

---

### Building

```bash
./build.sh
```

---

### Publishing

#### Publish:

```bash
./publish.sh
```

#### Unpublish:

```bash
# current version
npm unpublish --force

# specific version
npm unpublish @postfmly/logoserver@[version] --force
```

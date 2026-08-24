# @postfmly/logoserver

### Logo server <!-- markdownlint-disable MD001 -->

---

![Bun](https://img.shields.io/badge/Bun-~1.4.0-informational?style=plastic&logo=bun "Bun")

![CodeQL](https://github.com/chump29/logoserver/workflows/CodeQL/badge.svg "CodeQL") &nbsp;
![Coverage](https://img.shields.io/badge/Coverage-97.78%25-success?style=plastic&logo=jest "Coverage")

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

|      Description      |    Key     |       Value       |
|:---------------------:|:----------:|:-----------------:|
|         Debug         |   DEBUG    |  true/**false**   |
|       IPv4/IPv6       | LOGO_IPV6  |  true/**false**   |
| Logo Name<sup>1</sup> | LOGO_NAME  |    [filename]     |
|    Logo Local Path    | LOGO_PATH  |      [path]       |
|         Port          | LOGO_PORT  | **random**/[port] |
|      Logo 2 Name      | LOGO2_NAME |    [filename]     |
|   Logo 2 Local Path   | LOGO2_PATH |      [path]       |

###### <sup>1</sup> Required

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
